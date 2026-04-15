def caesar_shift(text: str, k: int) -> str:
    out = []
    for ch in text:
        if 'a' <= ch <= 'z':
            out.append(chr((ord(ch) - ord('a') + k) % 26 + ord('a')))
        elif 'A' <= ch <= 'Z':
            out.append(chr((ord(ch) - ord('A') + k) % 26 + ord('A')))
        else:
            out.append(ch)
    return "".join(out)

def decrypt(ciphertext: str, k: int) -> str:
    return caesar_shift(ciphertext, -k)

def brute_force(ciphertext: str, min_k: int = 2, max_k: int = 10):
    for k in range(min_k, max_k + 1):
        candidate = decrypt(ciphertext, k)
        print(f"Key {k}: {candidate}")
def brute_force_find_key(ciphertext: str, original_plaintext: str, min_k: int = 2, max_k: int = 10):
    for k in range(min_k, max_k + 1):
        candidate = decrypt(ciphertext, k)
        if candidate == original_plaintext:
            return k, candidate
    return None, None