'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns to display.
   * @default 3
   */
  columns?: number;
  /**
   * The gap between items in the grid, corresponding to Tailwind's spacing scale.
   * @default 4
   */
  gap?: number;
}

// Responsive column scales (1 col on phones → up to N on desktop).
// Tailwind needs literal class names, so we map the desired max column count.
const COLUMN_CLASSES: Record<number, string> = {
  2: 'columns-2',
  3: 'columns-2 lg:columns-3',
  4: 'columns-2 md:columns-3 xl:columns-4',
  5: 'columns-2 md:columns-3 lg:columns-4 2xl:columns-5',
};

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 4, children, ...props }, ref) => {
    // Only the gap is set inline; column count is responsive via Tailwind classes.
    const style = {
      columnGap: `${gap * 0.25}rem`, // Converts gap unit to rem
    };
    const columnsClass = COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[3];

    // Animation variants for child elements
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1] as const,
        },
      },
    };

    return (
      <div ref={ref} style={style} className={cn('w-full', columnsClass, className)} {...props}>
        {React.Children.map(children, (child) => (
          <motion.div
            className="mb-4 break-inside-avoid" // Prevents items from breaking across columns
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Animate when 20% of the item is visible
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }
);

MasonryGrid.displayName = 'MasonryGrid';

export { MasonryGrid };
