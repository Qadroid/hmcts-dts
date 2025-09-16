import Pocketbase from "Pocketbase";
import { PUBLIC_POCKETBASE_URL } from "$env/static/public";

const pocketbase = new Pocketbase(PUBLIC_POCKETBASE_URL);

export default pocketbase;
