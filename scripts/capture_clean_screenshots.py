import os
import time
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "images")
os.makedirs(OUT_DIR, exist_ok=True)

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # 1. Landing Hero & Hotspot Basin Map
        print("Capturing 01_landing_hero.png...")
        page.goto("https://frontend-six-woad-12.vercel.app", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUT_DIR, "01_landing_hero.png"), full_page=False)

        # 2. Physical Infrastructure Cross-Section Viewer
        print("Capturing 02_infrastructure_cross_section.png...")
        page.goto("https://frontend-six-woad-12.vercel.app/#infrastructure", wait_until="networkidle")
        time.sleep(2)
        infra_el = page.locator("#infrastructure")
        if infra_el.count() > 0:
            infra_el.scroll_into_view_if_needed()
            time.sleep(1)
        page.screenshot(path=os.path.join(OUT_DIR, "02_infrastructure_cross_section.png"), full_page=False)

        # 3. Dynamic Causal Flowchart & Hydraulic Parameter Simulation
        print("Capturing 03_causal_flowchart.png...")
        page.goto("https://frontend-six-woad-12.vercel.app/#flowchart", wait_until="networkidle")
        time.sleep(2)
        flow_el = page.locator("#flowchart")
        if flow_el.count() > 0:
            flow_el.scroll_into_view_if_needed()
            time.sleep(1)
        page.screenshot(path=os.path.join(OUT_DIR, "03_causal_flowchart.png"), full_page=False)

        # 4. Investigation Full Visual Causal Graph Modal
        print("Capturing 04_causal_mechanisms_dag.png...")
        page.goto("http://localhost:3000/investigations/4d076680-9dca-4bf1-af91-e4703290ee0f", wait_until="networkidle")
        time.sleep(2)
        # Click the 2. Causal DAG & Ranking tab
        dag_tab = page.locator("text=2. Causal DAG & Ranking").first
        if dag_tab.count() > 0:
            dag_tab.click()
            time.sleep(1.5)

        # Click the Full Visual Graph button
        btn = page.locator("text=Full Visual Graph").first
        if btn.count() > 0:
            btn.click()
            time.sleep(1.5)
            # Take screenshot of the entire page showing the beautiful full-screen modal with blur
            page.screenshot(path=os.path.join(OUT_DIR, "04_causal_mechanisms_dag.png"), full_page=False)
        else:
            page.screenshot(path=os.path.join(OUT_DIR, "04_causal_mechanisms_dag.png"), full_page=False)

        browser.close()
        print("All 4 clean screenshots successfully generated in", OUT_DIR)

if __name__ == "__main__":
    capture_all()
