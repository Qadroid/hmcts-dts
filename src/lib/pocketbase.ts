import Pocketbase from "Pocketbase";
import { PUBLIC_POCKETBASE_URL } from "$env/static/public";

export const pocketbase = new Pocketbase(PUBLIC_POCKETBASE_URL);
pocketbase.autoCancellation(false);

export default pocketbase;
