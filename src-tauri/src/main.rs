// Punto de entrada del binario de escritorio (Tauri v2).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tesis_psi_lib::run()
}
