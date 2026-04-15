import random


def caesar_shift(text: str, k: int) -> str:
    result = []
    for ch in text:
        if 'a' <= ch <= 'z':
            base = ord('a')
            result.append(chr((ord(ch) - base + k) % 26 + base))
        elif 'A' <= ch <= 'Z':
            base = ord('A')
            result.append(chr((ord(ch) - base + k) % 26 + base))
        else:
            result.append(ch)
    return "".join(result)


def encrypt(plaintext: str, k: int) -> str:
    return caesar_shift(plaintext, k)


def decrypt(ciphertext: str, k: int) -> str:
    return caesar_shift(ciphertext, -k)


def brute_force_discover_key(ciphertext: str, original_plaintext: str, min_k: int = 2, max_k: int = 10):
    for k in range(min_k, max_k + 1):
        candidate = decrypt(ciphertext, k)
        if candidate == original_plaintext:
            return k, candidate
    return None, None


def main():
    plaintext = input("Enter plaintext: ")

    k_secret = random.randint(2, 10)
    ciphertext = encrypt(plaintext, k_secret)

    print("\n--- Encryption ---")
    print(f"Ciphertext: {ciphertext}")

    print("\n--- Brute Force Attack (trying keys 2..10) ---")
    found_k, recovered_plaintext = brute_force_discover_key(ciphertext, plaintext, 2, 10)

    if found_k is None:
        print("Failed to discover key.")
    else:
        print(f"Discovered key: {found_k}")
        print(f"Recovered plaintext: {recovered_plaintext}")

    print(f"\n(For verification) Secret generated key was: {k_secret}")


if __name__ == "__main__":
    main()
