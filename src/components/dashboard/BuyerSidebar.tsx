import { Heart } from 'lucide-react';

// In your sidebar links array or JSX
<Link 
  to="/buyer-dashboard/saved"
  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
>
  <Heart className="h-5 w-5" />
  <span>Saved Properties</span>
</Link> 