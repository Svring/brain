import { WindowProps, useChatContext } from "@copilotkit/react-ui";
import { motion, AnimatePresence } from "framer-motion";

export function CopilotWindow({ children }: WindowProps) {
  const { open, setOpen } = useChatContext();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <motion.div
            className="fixed top-0 right-0 w-[40%] h-screen overflow-auto bg-background border-l rounded-l-lg shadow-xl"
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
