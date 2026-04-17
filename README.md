# ⚡ CUDA-IN-2027 — คู่มือ CUDA ฉบับภาษาไทย

> **Personal knowledge base** บน CUDA, GPU Programming และ Parallel Computing  
> สร้างด้วยระบบ **LLM Second Brain** + เว็บไซต์ทำด้วย **Claude Code**

---

## 🌐 ดู Website

เปิดไฟล์ `index.html` ในเบราว์เซอร์ หรือ serve ด้วย static file server ใดก็ได้:

```bash
# ตัวอย่าง: ใช้ Python built-in server
python -m http.server 8080
# แล้วเปิด http://localhost:8080
```

---

## 📖 เนื้อหาในวิกิ (13 หน้า)

| หน้า | หัวข้อ |
|------|--------|
| 🏠 ภาพรวม | Thesis หลัก, แผนผังแนวคิด, ข้อสังเกตสำคัญ |
| 📐 โมเดลการโปรแกรม CUDA | Thread/Block/Grid, kernel launch, built-in variables, clusters (CC 9.0+) |
| ⚙️ โมเดลการรัน SIMT | Warp scheduling, divergence, independent thread scheduling (CC 7.0+) |
| 💾 ลำดับชั้นหน่วยความจำ | Register → Shared → L2 → Global (HBM) → Constant |
| 🔗 Memory Coalescing | ประสิทธิภาพลด 32x ถ้า uncoalesced |
| 🧩 Shared Memory & Tiling | Load-once-reuse-many, bank conflicts, padding |
| 🌊 Streams & Events | Async concurrency, host-device overlap, pinned memory |
| ⏳ Async Barriers & Pipelines | cuda::barrier, LDGSTS (CC 8.0+), TMA (CC 9.0+), double-buffering |
| 📊 Occupancy Optimization | Register/smem limits, `cudaOccupancyMaxPotentialBlockSize`, `__launch_bounds__` |
| 🖥️ Multi-GPU Programming | P2P transfers, NVLink, NCCL, NVSHMEM |
| 📋 Compute Capabilities | ตาราง CC 7.5–12.x, SM limits, Tensor Core types |
| 🚀 NVIDIA H100 | Hopper CC 9.0: 3.35 TB/s, TMA, FP8, Thread Block Clusters |
| 💡 NVIDIA A100 | Ampere CC 8.0: 2.0 TB/s, TF32, Sparsity, MIG |

---

## 🧠 LLM Second Brain — ผมเรียนรู้อะไรบ้าง

โปรเจกต์นี้ไม่ใช่แค่การอ่านเอกสาร — แต่เป็นการทดลองใช้ **LLM เป็น "สมองที่สอง"** สำหรับสร้างและดูแล knowledge base แบบถาวร

### แนวคิดหลัก: LLM Wiki Agent

```
raw/        ← เราโยน source documents ลงไป (อ่านอย่างเดียว)
  └─ articles/    clipped web articles
  └─ papers/      academic papers
  └─ notes/       บันทึกส่วนตัว

wiki/       ← LLM เขียนและดูแลทั้งหมด
  ├─ overview.md      synthesis ภาพรวม
  ├─ concepts/        หน้า concept แต่ละหัวข้อ
  ├─ entities/        GPU models, libraries, papers
  ├─ sources/         สรุป source แต่ละชิ้น
  └─ outputs/         analyses, comparisons, websites
```

แทนที่จะ "ถาม LLM แล้วลืม" — เราให้ LLM **เขียนและอัปเดต wiki** ไปเรื่อยๆ ทุกครั้งที่เรา ingest source ใหม่

---

### สิ่งที่ผมเรียนรู้จากระบบนี้

#### 1. 🔄 Knowledge ต้อง "Compound" ได้

ปัญหาของการถาม LLM แบบธรรมดาคือ context หายทุก session  
ระบบ Second Brain แก้ปัญหานี้ด้วยการให้ LLM **append ความรู้ใหม่เข้า wiki** ที่มีอยู่ แทนที่จะตอบแล้วทิ้ง

> ความรู้ session ที่ 10 ต้องฉลาดกว่า session ที่ 1 เพราะ wiki ใหญ่ขึ้นเรื่อยๆ

#### 2. ⚠️ Contradiction Detection สำคัญมาก

เมื่อ ingest source ใหม่ — LLM ต้อง **ตรวจสอบความขัดแย้ง** กับ wiki ที่มีอยู่  
ตัวอย่างที่เจอในโปรเจกต์นี้:

> **Texture Memory** — source เก่าบอกว่ายังมีประโยชน์  
> แต่ CUDA Programming Guide อย่างเป็นทางการบอกว่า:  
> _"texture and surface memory instructions no longer provide any performance benefit"_  
>   
> → ระบบ flagged contradiction → อัปเดต wiki ให้ถูกต้อง

#### 3. 📐 Schema ที่ดีคือหัวใจของระบบ

ไฟล์ `CLAUDE.md` ทำหน้าที่เป็น **"constitution"** ของ agent:
- กำหนด directory layout
- กำหนด frontmatter ของทุกหน้า
- กำหนด operations: `ingest`, `query`, `lint`
- กำหนด writing style (encyclopedic, dense, no fluff)

Schema ที่ชัดเจน = LLM ทำงานสม่ำเสมอข้าม session

#### 4. 🎯 "Thesis-first" ช่วยให้ synthesis ดีกว่า

แทนที่จะเก็บ facts ดิบๆ — wiki มี **central thesis**:

> _"GPU performance optimization เป็นปัญหาสองมิติ: parallelism และ memory  
> ทุก optimization technique คือ strategy สำหรับ maximize ทั้งสองมิตินี้"_

Thesis นี้ทำให้ทุก concept page **เชื่อมโยงกัน** แทนที่จะเป็น isolated notes

#### 5. 🔍 Wiki ต้องมี "Open Gaps"

การ track สิ่งที่ยัง **ไม่รู้** สำคัญพอๆ กับสิ่งที่รู้แล้ว  
`wiki/overview.md` มี section "Open Gaps" บอกว่าหัวข้อไหนยังไม่ได้ ingest:

- CUDA Graphs, Unified Memory, Cooperative Groups
- NVCC compilation workflow, Dynamic Parallelism
- Profiling workflow (Nsight Compute, roofline model)

---

### สิ่งที่ผมเรียนรู้ด้าน CUDA

| แนวคิด | Insight หลัก |
|--------|-------------|
| **Parallelism vs Memory** | GPU ไม่ได้ช้าเพราะ compute — แต่ช้าเพราะ memory bandwidth และ latency |
| **Warp = หน่วยฮาร์ดแวร์จริงๆ** | 32 threads รัน instruction เดียวกันพร้อมกัน — divergence ทำให้ serialize |
| **Zero-cost context switch** | GPU ซ่อน latency ด้วยการสลับ warp แทน — ต้องมี warp เพียงพอ (occupancy) |
| **Coalescing คือ bottleneck ใหญ่** | Access pattern ที่ไม่ต่อเนื่องทำ bandwidth ลด 32x |
| **Shared memory คือ scratchpad** | Load จาก global ครั้งเดียว ใช้ซ้ำหลายครั้ง — tiling pattern |
| **CC กำหนด feature ที่ใช้ได้** | TMA ต้อง CC 9.0+, async barrier ต้อง CC 8.0+, independent thread scheduling CC 7.0+ |
| **H100 vs A100** | Memory bandwidth +68%, shared mem/SM +39%, เพิ่ม TMA, FP8, Thread Block Clusters |

---

## 🛠️ ทำเว็บไซต์ด้วย Claude Code

เว็บไซต์นี้สร้างทั้งหมดด้วย **Claude Code** (Anthropic's agentic coding tool) จาก knowledge ใน wiki

### Stack ที่ใช้

| ส่วน | เทคโนโลยี |
|------|-----------|
| Structure | Vanilla HTML5 (semantic, single-page) |
| Styling | Vanilla CSS (custom design system, no frameworks) |
| Logic | Vanilla JavaScript (ES2020+, no build step) |
| Font | Google Fonts — Sarabun (Thai) + JetBrains Mono (code) |

### Design Decisions

**ทำไมไม่ใช้ Framework?**  
เว็บไซต์ static documentation ไม่ต้องการ React หรือ Next.js  
Vanilla stack = ไม่มี build step, เปิดไฟล์แล้วใช้ได้เลย

**ทำไมไม่ใช้ Tailwind?**  
Custom CSS ให้ควบคุม design tokens ได้ละเอียดกว่า  
ใช้ CSS custom properties (`--accent`, `--bg`, `--border`) เป็น design system

**Color Palette**  
Deep green (`#1a7a3a`) เป็น accent — ตัดกับ white background อ่านง่าย  
ทุกสี defined เป็น CSS variables เพื่อ consistency

### Features

- 🔍 **Full-text search** — filter pages แบบ real-time
- ⌨️ **Keyboard shortcut** — กด `/` เพื่อ focus search
- 📱 **Responsive** — sidebar collapse บน mobile
- 🔗 **URL hash routing** — `#memory-coalescing` ไปหน้าถูกต้อง
- ✨ **Micro-animations** — fade-in สำหรับ page transitions, bandwidth bars animate on load
- 🎨 **Component-based CSS** — callouts, cards, tables, hierarchy viz, memory pyramid

### Prompt Engineering สำหรับ Claude Code

สิ่งที่ช่วยให้ Claude Code สร้าง output ที่ดี:

1. **ให้ content ก่อน** — โยน wiki pages ให้อ่าน แล้วค่อยบอกให้สร้าง website
2. **ระบุ constraints ชัดเจน** — "Vanilla HTML/CSS/JS, no frameworks, Thai as primary language"
3. **Design direction** — "dark green accent, encyclopedic feel, sidebar navigation"
4. **ให้ iterate** — review แล้วบอก feedback เฉพาะจุด แทนที่จะ regenerate ทั้งหมด

---

## 📁 โครงสร้างโปรเจกต์

```
CUDA-IN-2027/
├── CLAUDE.md                    ← Schema และ rules สำหรับ LLM Agent
├── wiki/
│   ├── index.md                 ← Master catalog ของทุก page
│   ├── log.md                   ← Append-only changellog
│   ├── overview.md              ← High-level synthesis
│   ├── concepts/                ← 9 concept pages
│   ├── entities/                ← GPU models + compute capabilities
│   ├── sources/                 ← Source summaries
│   └── outputs/
│       └── cuda-wiki-thai/      ← (ที่นี่) Thai website output
│           ├── index.html
│           ├── style.css
│           ├── app.js
│           └── README.md        ← ไฟล์นี้
└── raw/                         ← Source documents (read-only)
    └── articles/
        ├── CUDA Programming Guide (official)
        └── cuda-memory-hierarchy-primer
```

---

## 📚 แหล่งข้อมูล

| Source | ประเภท |
|--------|--------|
| NVIDIA CUDA Programming Guide (official) | Documentation |
| cuda-memory-hierarchy-primer | Article |

> 2 sources · 24+ raw files ingested · 38 wiki pages · สังเคราะห์เป็น 13 หน้าเว็บ

---

## 🗓️ Timeline

| วันที่ | เหตุการณ์ |
|--------|----------|
| 2026-04-16 | เริ่ม ingest CUDA sources เข้า wiki |
| 2026-04-17 | สร้าง website ด้วย Claude Code — output `cuda-wiki-thai` |

---

_อัปเดต: 17 เมษายน 2569 (2026)_
