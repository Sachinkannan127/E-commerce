import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface AddressData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  alternate_phone?: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  address_type: "HOME" | "WORK" | "OTHER";
  is_default: boolean;
}

export async function fetchUserAddresses(): Promise<AddressData[]> {
  try {
    const res = await apiClient.get<ApiResponse<AddressData[]>>("/users/addresses");
    return res.data?.data || [];
  } catch (err: any) {
    if (err.response?.status === 401) {
      return [];
    }
    return [];
  }
}

export async function createUserAddress(data: Omit<AddressData, "id" | "user_id">): Promise<AddressData> {
  const res = await apiClient.post<ApiResponse<AddressData>>("/users/addresses", data);
  return res.data.data;
}

export async function deleteUserAddress(addressId: string): Promise<void> {
  await apiClient.delete<ApiResponse<any>>(`/users/addresses/${addressId}`);
}
