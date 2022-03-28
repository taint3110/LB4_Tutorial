import dotenv from 'dotenv';
import path from "path"
dotenv.config({ path: path.join(__dirname, '../../', '.env') })
export const configs: {
  MONGODB_URL: string | undefined,
  LOCAL_DB_URL: string | undefined,
} = {
  LOCAL_DB_URL: process.env.MONGODB_URL,
  MONGODB_URL: process.env.MONGODB_CLOUD_URL,
}