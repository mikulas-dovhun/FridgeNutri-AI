import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function GlassCard({ children, className = "", ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative bg-gradient-to-br from-white/10 via-white/5 to-white/0 backdrop-blur-3xl",
        "border border-white/20",
        "shadow-2xl shadow-black/10",
        "rounded-3xl p-8",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-600/10",
        "before:rounded-3xl before:blur-xl before:-z-10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}