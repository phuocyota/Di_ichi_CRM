function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo-diichi.webp"
        alt="Di-Ichi"
        className={compact ? 'h-9 w-auto rounded object-contain' : 'h-12 w-auto rounded object-contain'}
      />
      {!compact ? (
        <div>
          <p className="text-sm font-semibold text-ink-900">Di-Ichi</p>
          <p className="text-xs text-ink-500">Cổng quản trị trung tâm</p>
        </div>
      ) : null}
    </div>
  )
}

export default BrandLogo
