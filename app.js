'use strict';

/* ───── Page navigation ───── */
const PAGE_NAMES = {
  'overview':          'ภาพรวม',
  'programming-model': 'โมเดลการโปรแกรม CUDA',
  'execution-model':   'โมเดลการรัน SIMT',
  'memory-hierarchy':  'ลำดับชั้นหน่วยความจำ',
  'memory-coalescing': 'Memory Coalescing',
  'shared-memory':     'Shared Memory & Tiling',
  'streams-events':    'Streams & Events',
  'async-barriers':    'Async Barriers & Pipelines',
  'occupancy':         'Occupancy Optimization',
  'multi-gpu':         'Multi-GPU Programming',
  'compute-caps':      'Compute Capabilities',
  'h100':              'NVIDIA H100',
  'a100':              'NVIDIA A100',
};

function showPage(id) {
  // hide all
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // show target
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  // highlight nav
  const navItem = document.querySelector(`.nav-item[data-page="${id}"]`);
  if (navItem) navItem.classList.add('active');

  // update breadcrumb
  const bc = document.getElementById('breadcrumb');
  if (bc) bc.textContent = PAGE_NAMES[id] || id;

  // scroll to top
  document.querySelector('.main').scrollTo({ top: 0, behavior: 'smooth' });

  // update hash
  history.replaceState(null, '', '#' + id);

  // close sidebar on mobile
  if (window.innerWidth < 900) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

/* ───── Sidebar toggle (mobile) ───── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ───── Search ───── */
const searchInput = document.getElementById('searchInput');

const SEARCH_INDEX = [
  { page: 'overview',          keywords: 'ภาพรวม thesis หลัก แนวคิด กลาง cuda gpu' },
  { page: 'programming-model', keywords: 'thread block grid warp kernel launch heterogeneous โมเดล การโปรแกรม built-in variables' },
  { page: 'execution-model',   keywords: 'simt warp scheduling divergence independent thread scheduling โมเดลการรัน scopes' },
  { page: 'memory-hierarchy',  keywords: 'register shared memory l1 l2 global hbm constant local ลำดับชั้น หน่วยความจำ bandwidth latency' },
  { page: 'memory-coalescing', keywords: 'coalescing coalesced uncoalesced global memory bandwidth transaction warp' },
  { page: 'shared-memory',     keywords: 'shared memory tiling bank conflict syncthreads padding gemm scratchpad' },
  { page: 'streams-events',    keywords: 'stream event async asynchronous concurrent overlap cudamemcpyasync pinned' },
  { page: 'async-barriers',    keywords: 'barrier async pipeline ldgsts tma memcpy_async double buffering hopper ampere' },
  { page: 'occupancy',         keywords: 'occupancy register shared memory latency hiding launch_bounds maxrregcount sm' },
  { page: 'multi-gpu',         keywords: 'multi gpu peer to peer nvlink nccl nvshmem ipc cudaipc multi device' },
  { page: 'compute-caps',      keywords: 'compute capability cc 7.5 8.0 8.6 9.0 10.0 tensor core sm limits memory specs table' },
  { page: 'h100',              keywords: 'h100 hopper 9.0 hbm3 3.35 tb nvlink 4.0 transformer engine fp8 tma clusters' },
  { page: 'a100',              keywords: 'a100 ampere 8.0 hbm2e 2.0 tb nvlink 3.0 tf32 mig multi instance gpu sparsity' },
];

let searchTimeout;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;

    const matches = SEARCH_INDEX.filter(item =>
      item.keywords.toLowerCase().includes(q) ||
      (PAGE_NAMES[item.page] || '').toLowerCase().includes(q)
    );

    if (matches.length > 0) {
      showPage(matches[0].page);
    }
  }, 300);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;
    const match = SEARCH_INDEX.find(item =>
      item.keywords.toLowerCase().includes(q) ||
      (PAGE_NAMES[item.page] || '').toLowerCase().includes(q)
    );
    if (match) showPage(match.page);
  }
});

/* ───── Keyboard shortcut: / to focus search ───── */
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') searchInput.blur();
});

/* ───── Restore from hash on load ───── */
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if (hash && PAGE_NAMES[hash]) {
    showPage(hash);
  }

  // Animate BW bars after load
  setTimeout(() => {
    document.querySelectorAll('.bw-bar').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => {
        bar.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
        bar.style.width = w;
      });
    });
  }, 100);
});

/* ───── Close sidebar when clicking outside (mobile) ───── */
document.querySelector('.main').addEventListener('click', () => {
  if (window.innerWidth < 900) {
    document.getElementById('sidebar').classList.remove('open');
  }
});
