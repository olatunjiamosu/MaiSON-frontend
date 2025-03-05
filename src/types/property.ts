export interface PropertyAddress {
  house_number?: string;
  street: string;
  city: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  reception_rooms?: number;
  square_footage: number;
  property_type: string;
  epc_rating?: string;
}

export interface PropertyDetails {
  description?: string;
  property_type?: string;
  construction_year?: number;
  parking_spaces?: number;
  heating_type?: string;
}

export interface PropertyFeatures {
  has_garden?: boolean;
  garden_size?: number;
  has_garage?: boolean;
  parking_spaces?: number;
}

export interface PropertyMedia {
  image_url: string;
  image_type?: string;
  display_order?: number;
}

export interface PropertySummary {
  id: string;
  property_id?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  main_image_url?: string;
  created_at: string;
  owner_id: number;
  seller_id?: string;
  status?: string;
  viewings?: number;
  inquiries?: number;
  favorites?: number;
  address: {
    street: string;
    city: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  specs: {
    property_type: string;
    square_footage: number;
  };
}

export interface PropertyDetail {
  id: string;
  property_id?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  main_image_url?: string;
  image_urls?: string[];
  floorplan_url?: string;
  created_at: string;
  last_updated?: string;
  owner_id: number;
  address: PropertyAddress;
  specs: PropertySpecs;
  details?: PropertyDetails;
  features?: PropertyFeatures;
}

export interface CreatePropertyRequest {
  price: number;
  user_id: string | number;
  main_image_url?: string;
  address: PropertyAddress;
  specs: PropertySpecs;
  details?: PropertyDetails;
  features?: PropertyFeatures;
  media?: PropertyMedia[];
}

export interface PropertyResponse {
  id: string;
  message: string;
  warnings?: string[];
  image_urls?: string[];
}

export interface PropertyFilters {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  property_type?: string;
  has_garden?: boolean;
  parking_spaces?: number;
}

export interface ErrorResponse {
  error?: string;
  errors?: string[];
  message?: string;
}

// New interfaces for dashboard data
export interface SavedProperty {
  property_id: string;
  saved_at: string;
  notes?: string;
  price: number;
  main_image_url: string;
  status: string;
  address: {
    street: string;
    city: string;
    postcode: string;
  };
  specs: {
    bedrooms: number;
    bathrooms: number;
    property_type: string;
    square_footage?: number;
  };
}

export interface Transaction {
  transaction_id: string;
  offer_amount: number;
  made_by: string;
  created_at: string;
}

export interface Negotiation {
  negotiation_id: string;
  property_id: string;
  buyer_id: string;
  status: string;
  current_offer: number;
  last_offer_by: string;
  awaiting_response_from: string;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
}

export interface UserRole {
  role_type: string;
}

export interface UserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface DashboardResponse {
  user: UserInfo;
  roles: UserRole[];
  saved_properties: SavedProperty[];
  listed_properties: PropertySummary[];
  negotiations_as_buyer: Negotiation[];
  negotiations_as_seller: Negotiation[];
  total_saved_properties: number;
  total_properties_listed: number;
} 