import { publicClient } from "./client";

/**
 * Endpoint publik (tanpa login) yang diakses saat QR code kemasan di-scan.
 * Backend: GET /public/trace/{kode_batch}
 */
export async function traceBatch(kodeBatch) {
  const { data } = await publicClient.get(`/trace/${kodeBatch}`);
  return {
    ...data.batch_info,
    verifikasi_integritas: data.blockchain_verification
  };
}
