import { LeaderboardSkeleton } from "../skeletons/LeaderboardSkeleton";
import { motion } from "framer-motion";

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <LeaderboardSkeleton count={15} />
    </motion.div>
  );
}
