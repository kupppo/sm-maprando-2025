export function LoadingDots() {
  return (
    <div className="flex space-x-1 justify-center">
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          className="w-1 h-1 bg-primary rounded-full animate-loading"
          style={{ animationDelay: `${dot * 0.2}s` }}
        />
      ))}
    </div>
  )
}
