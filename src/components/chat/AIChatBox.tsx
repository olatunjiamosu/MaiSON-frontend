// Update the expanded chat box styles
const expandedStyles = {
  width: '400px', // Reduced from previous width
  height: '80vh',  // Increased height to be taller
  maxHeight: '800px'
};

// If you're using Tailwind classes, it would be:
<div className={`
  fixed bottom-4 right-4 
  bg-white rounded-lg shadow-lg 
  transition-all duration-300 ease-in-out
  ${isExpanded 
    ? 'w-[400px] h-[80vh] max-h-[800px]' // Thinner and taller
    : 'w-16 h-16'
  }
`}> 