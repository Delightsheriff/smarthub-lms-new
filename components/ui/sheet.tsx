"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { animate } from "motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const DISMISS_FRACTION = 0.35
const DISMISS_VELOCITY = 0.11
type SheetPointerEvent = Parameters<NonNullable<SheetPrimitive.Popup.Props["onPointerDown"]>>[0]

export function shouldDismissSheet({
  distance,
  velocity,
  size,
  threshold = DISMISS_FRACTION,
  velocityThreshold = DISMISS_VELOCITY,
}: {
  distance: number
  velocity: number
  size: number
  threshold?: number
  velocityThreshold?: number
}) {
  return distance >= size * threshold || velocity >= velocityThreshold
}

function projectMomentum(velocity: number, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate)
}

function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  onDismiss,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  onDismiss?: () => void
}) {
  const popupRef = React.useRef<HTMLDivElement>(null)
  const gesture = React.useRef<{
    pointerId: number
    start: number
    size: number
    last: { position: number; time: number }[]
  } | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const getAxis = (event: { clientX: number; clientY: number }) =>
    side === "left" || side === "right" ? event.clientX : event.clientY

  const direction = side === "top" || side === "left" ? -1 : 1

  const setOffset = (offset: number) => {
    const element = popupRef.current
    if (!element) return
    const value = direction === 1 ? offset : -offset
    element.style.translate = side === "left" || side === "right" ? `${value}px` : `0 ${value}px`
  }

  const settle = (distance: number, velocity: number) => {
    const element = popupRef.current
    const current = direction * distance
    const projected = Math.max(0, current + projectMomentum(Math.max(0, velocity)))
    const target = shouldDismissSheet({
      distance: Math.max(current, projected),
      velocity,
      size: gesture.current?.size ?? 1,
    })
      ? gesture.current?.size ?? 0
      : 0

    if (!element) return
    animate(
      element,
      { translate: side === "left" || side === "right" ? `${direction * target}px` : `0 ${direction * target}px` },
      { type: "spring", bounce: target ? 0.2 : 0, duration: 0.35 },
    )
    if (target) onDismiss?.()
  }

  const handlePointerDown = (event: SheetPointerEvent) => {
    onPointerDown?.(event)
    if (event.button !== 0 || !popupRef.current) return
    const rect = popupRef.current.getBoundingClientRect()
    const size = side === "left" || side === "right" ? rect.width : rect.height
    popupRef.current.setPointerCapture(event.pointerId)
    gesture.current = {
      pointerId: event.pointerId,
      start: getAxis(event),
      size,
      last: [{ position: getAxis(event), time: performance.now() }],
    }
    setDragging(true)
  }

  const handlePointerMove = (event: SheetPointerEvent) => {
    onPointerMove?.(event)
    const active = gesture.current
    if (!active || active.pointerId !== event.pointerId) return
    const now = performance.now()
    const signedDistance = (getAxis(event) - active.start) * direction
    const offset = signedDistance < 0 ? rubberband(signedDistance, active.size) : signedDistance
    setOffset(offset)
    active.last = [...active.last, { position: getAxis(event), time: now }].filter(
      (sample) => now - sample.time < 120,
    )
  }

  const handlePointerUp = (event: SheetPointerEvent) => {
    onPointerUp?.(event)
    const active = gesture.current
    if (!active || active.pointerId !== event.pointerId) return
    const now = performance.now()
    const previous = active.last[0] ?? { position: getAxis(event), time: now }
    const velocity = Math.max(
      0,
      ((getAxis(event) - previous.position) / Math.max(1, now - previous.time)) * direction,
    )
    const distance = Math.max(0, (getAxis(event) - active.start) * direction)
    settle(distance, velocity)
    gesture.current = null
    setDragging(false)
  }

  const handlePointerCancel = (event: SheetPointerEvent) => {
    onPointerCancel?.(event)
    if (!gesture.current || gesture.current.pointerId !== event.pointerId) return
    settle(0, 0)
    gesture.current = null
    setDragging(false)
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        ref={popupRef}
        data-slot="sheet-content"
        data-side={side}
        data-dragging={dragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={cn(
          "glass-thick fixed z-50 flex flex-col gap-4 bg-clip-padding text-sm transition duration-250 ease-[var(--ease-drawer)] data-[dragging=true]:transition-none data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
