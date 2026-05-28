import { cn } from "@/lib/utils"

interface StarRatingProps {
  value?: number
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
}

export function StarRating({ value = 0, size = "md" }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((rating) => (
        <span key={rating}>
          <svg
            viewBox="0 0 24 24"
            className={cn(
              sizeClasses[size],
              rating <= value ? "fill-star text-star" : "fill-star-empty text-star-empty"
            )}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </span>
      ))}
    </div>
  )
}
