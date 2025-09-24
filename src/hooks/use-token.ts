import { useSearchParams } from "next/navigation";

export function useToken() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return token;
}
