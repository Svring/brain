import { StarBorder } from "@/components/ui/star-border";
import { ButtonProps, useChatContext } from "@copilotkit/react-ui";
import { Bird } from "lucide-react";
import { motion } from "framer-motion";

export function CopilotButton({}: ButtonProps) {
  const { open, setOpen } = useChatContext();

  return (
    <motion.div
      className="bottom-4 right-4 fixed"
      onClick={() => setOpen(!open)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        rotate: open ? -360 : 0,
        scale: open ? 1.1 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.2,
      }}
    >
      <motion.button
        className={`${open ? "open" : ""}`}
        aria-label={open ? "Close Chat" : "Open Chat"}
        transition={{ duration: 0.2 }}
      >
        <StarBorder className="w-12 h-12 p-0 flex items-center justify-center border border-text-foreground">
          <motion.div
            animate={{
              rotate: open ? 0 : 0,
              scale: open ? 1.2 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <Bird size={24} />
          </motion.div>
        </StarBorder>
      </motion.button>
    </motion.div>
  );
}
