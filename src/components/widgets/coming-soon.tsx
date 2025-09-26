

import Box from '@/components/ui/box';
import React from 'react';

interface ComingSoonProps {
  text?: string;
}

const ComingSoon = ({ text }: ComingSoonProps) => {
  return (
    <Box className="dark:bg-[#18181b] flex item-center justify-center h-screen">
      <Box>
        <Box as="p" className="mt-[70px] text-center mb-4 text-[60px]">
          🚧
        </Box>
        <Box as="p" className="text-center">
          {text || 'Under Construction'}
        </Box>
      </Box>
    </Box>
  );
}

export default ComingSoon
