import { WindowProps, useChatContext } from "@copilotkit/react-ui";
import { motion, AnimatePresence } from "framer-motion";

export function CopilotWindow({ children }: WindowProps) {
  const { open, setOpen } = useChatContext();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <motion.div
            className="fixed bottom-20 right-4 bg-background rounded-lg shadow-xl w-sm h-[90vh] overflow-auto border"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
          >
            <div className="flex flex-col h-full">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
