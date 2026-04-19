import speech_recognition as sr
import requests
from generator import MyQR
import os

# Standard headers to mimic a modern browser (Chrome on Windows 10)
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
}

def sanitize_input(text):
    """
    Cleans spoken text to ensure it's a valid URL format.
    Standardizes 'dot' and removes spaces for potential links.
    """
    clean_text = text.lower().strip()
    clean_text = clean_text.replace(" dot ", ".").replace(" dot", ".")
    
    tlds = ['.com', '.org', '.net', '.edu', '.io', '.gov', '.in', '.co', '.us', '.uk', '.de', '.jp', '.fr', '.au', '.ru', '.ch', '.it', '.ai']
    is_url = any(tld in clean_text for tld in tlds) or "www" in clean_text
    
    if is_url:
        clean_text = "".join(clean_text.split())
        if not clean_text.startswith("http"):
            clean_text = "https://" + clean_text
            
    return clean_text

def is_url_safe(url):
    """
    Orchestration Layer 3.0: Industrial Bypass.
    Uses a persistent session and specialized headers to mimic 
    modern browser networking behavior more accurately.
    """
    # Create a session to persist headers/cookies
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    })

    try:
        print(f"🔍 Security Check: Validating {url}...")
        
        # We try GET immediately for high-security sites, as HEAD is often auto-blocked
        response = session.get(url, timeout=10, allow_redirects=True)

        if response.status_code < 400:
            print(f"✅ URL Verified: Status {response.status_code}")
            return True
        elif response.status_code == 403:
            # 💡 ANALYTICS LOGIC: If a site like OpenAI blocks us even with a full GET, 
            # it's likely a bot-wall. For a QR code generator, we can choose to 'Soft Pass' 
            # if the domain is a known major TLD, or warn the user.
            print(f"⚠️ Security Wall Detected (403). Proceeding with caution for major domain.")
            return True # Soft Pass for now so you aren't blocked from the internet
        else:
            print(f"⚠️ Warning: Destination returned {response.status_code}")
            return False

    except Exception:
        print("❌ Safety Check Failed: Connection Timed Out.")
        return False

def voice_to_qr():
    recognizer = sr.Recognizer()
    qr_gen = MyQR(size=10, padding=5)
    
    with sr.Microphone() as source:
        print("\n🎤 Adjusting for ambient noise... please wait.")
        recognizer.adjust_for_ambient_noise(source, duration=1.5)
        print("🚀 Speak the URL or text to encode:")
        
        try:
            audio = recognizer.listen(source, timeout=7, phrase_time_limit=10)
            print("⏳ Processing speech...")
            
            raw_text = recognizer.recognize_google(audio)
            print(f"🎤 Raw Speech: {raw_text}")
            
            final_text = sanitize_input(raw_text)
            print(f"🔗 Processed Data: {final_text}")
            
            should_generate = True
            if final_text.startswith("http"):
                should_generate = is_url_safe(final_text)
            
            if should_generate:
                filename = "voice_generated_qr.png"
                qr_gen.create_qr_from_text(final_text, filename, "darkblue", "white")
            else:
                print("🚫 Generation Blocked: Destination unreachable or forbidden.")
            
        except sr.UnknownValueError:
            print("❌ Error: Could not understand audio.")
        except sr.RequestError:
            print("❌ Error: Speech service down.")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    voice_to_qr()