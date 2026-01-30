from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for the toast to appear (Safe Mode warning)
        # The toast text is "Đang chạy ở chế độ Safe Mode (Không có AI)"
        try:
            toast = page.get_by_text("Đang chạy ở chế độ Safe Mode")
            expect(toast).to_be_visible(timeout=10000)
            print("Toast appeared successfully.")
        except Exception as e:
            print(f"Toast did not appear: {e}")
            # Take a screenshot anyway to debug

        # Also check for "Safe Mode" in the prediction card if possible
        # Prediction is in a card with "Dự báo 24h" header

        # Open Settings Modal
        page.get_by_role("button", name="Cài đặt").click()
        expect(page.get_by_text("Cài đặt hệ thống")).to_be_visible()

        page.screenshot(path="verification/toast_verification.png")
        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    run()
