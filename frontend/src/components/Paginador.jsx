export default function Paginador({ total, page, pageSize, onPage, onPageSize }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  return (
    <div className="paginador">
      <span className="paginador-info">
        {from}–{to} de {total}
      </span>
      <div className="paginador-nav">
        <button className="paginador-btn" disabled={page === 1} onClick={() => onPage(1)} title="Primera">«</button>
        <button className="paginador-btn" disabled={page === 1} onClick={() => onPage(page - 1)} title="Anterior">‹</button>
        <span className="paginador-pages">{page} / {totalPages}</span>
        <button className="paginador-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)} title="Siguiente">›</button>
        <button className="paginador-btn" disabled={page >= totalPages} onClick={() => onPage(totalPages)} title="Última">»</button>
      </div>
      <select
        className="paginador-size form-control"
        value={pageSize}
        onChange={e => { onPageSize(Number(e.target.value)); onPage(1) }}
      >
        <option value={10}>10 / pág.</option>
        <option value={20}>20 / pág.</option>
        <option value={50}>50 / pág.</option>
        <option value={100}>100 / pág.</option>
      </select>
    </div>
  )
}
