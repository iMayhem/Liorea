
"use client"
import { motion } from 'framer-motion';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;
