"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Radio } from "lucide-react";

export type DataMode = "demo" | "mainnet";
const STORAGE_KEY = "memereach-data-mode";

export function getClientDataMode(): DataMode {
  if (typeof window === "undefined") return "demo";
  return window.localStorage.getItem(STORAGE_KEY) === "mainnet" ? "mainnet" : "demo";
}

export function DataModeSwitch() {
  const [mode, setMode] = useState<DataMode>("demo");
  useEffect(() => setMode(getClientDataMode()), []);
  function change(next: DataMode) {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `memereach_data_mode=${next}; Max-Age=2592000; Path=/; SameSite=Lax`;
    setMode(next);
    window.dispatchEvent(new CustomEvent("memereach:data-mode", { detail: next }));
    window.location.reload();
  }
  return <div className="data-mode-control" aria-label="Data source mode"><span className="data-mode-caption"><Activity style={{ width: 13 }}/> Data source</span><div className="data-mode-options"><button type="button" className={mode === "demo" ? "selected" : ""} onClick={() => change("demo")}><Database style={{ width: 12 }}/> Demo</button><button type="button" className={mode === "mainnet" ? "selected live" : ""} onClick={() => change("mainnet")}><Radio style={{ width: 12 }}/> Mainnet</button></div></div>;
}
