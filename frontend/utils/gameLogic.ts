import dictionaryData from '../data/dictionary.json';

const dictionary: Record<string, string[]> = dictionaryData;

export interface ValidationResponse {
    isValid: boolean;
    message: string;
    newScore?: number;
    isCombo?: boolean;
    bonusPoints?: number;
}

const TR_CULTURE = 'tr-TR';

export const gameLogic = {
    getCategories(): string[] {
        return Object.keys(dictionary);
    },

    getRandomWord(category: string): string {
        const words = dictionary[category] || dictionary['Genel'];
        return words[Math.floor(Math.random() * words.length)];
    },

    async validateWord(
        category: string,
        word: string,
        previousWord: string,
        usedWords: string[],
        lastActivity: number,
        currentScore: number
    ): Promise<ValidationResponse> {
        const searchWord = word.trim().toLocaleLowerCase(TR_CULTURE);

        if (!searchWord) {
            return { isValid: false, message: "Boş kelime girilemez." };
        }

        // Kelime zinciri kuralı
        if (previousWord) {
            const lastChar = previousWord.toLocaleLowerCase(TR_CULTURE).slice(-1);
            const firstChar = searchWord.charAt(0);

            if (lastChar !== firstChar) {
                return { isValid: false, message: `Kelime '${lastChar}' harfi ile başlamalı!` };
            }
        }

        // Tekrar kuralı
        if (usedWords.map(w => w.toLocaleLowerCase(TR_CULTURE)).includes(searchWord)) {
            return { isValid: false, message: "Bu kelime daha önce kullanıldı." };
        }

        // Sözlük kontrolü (Local)
        const catWords = dictionary[category] || dictionary['Genel'];
        let isValid = catWords.some(w => w.toLocaleLowerCase(TR_CULTURE) === searchWord);

        // Sözlük kontrolü (TDK API - Optional/Fallback)
        if (!isValid) {
            isValid = await tryValidateWithTdk(searchWord);
        }

        if (!isValid) {
            return { isValid: false, message: "Bu kelime sözlükte yok." };
        }

        // Kombo ve Bonus Hesaplama
        const now = Date.now();
        const timePassed = (now - lastActivity) / 1000;
        let basePoints = 10;
        let bonusPoints = 0;
        const isCombo = timePassed < 2.5;

        if (isCombo) bonusPoints += 5;

        // Nadir harf bonusu (J, Ğ, F, V, P)
        const rareChars = ['j', 'ğ', 'f', 'v', 'p'];
        for (const char of searchWord) {
            if (rareChars.includes(char)) bonusPoints += 3;
        }

        const newScore = currentScore + basePoints + bonusPoints;

        return {
            isValid: true,
            message: isCombo ? "PERFECT! +KOMBO" : "Başarılı!",
            newScore,
            isCombo,
            bonusPoints
        };
    },

    getHintWord(category: string, startingLetter: string, usedWords: string[]): string | null {
        const words = dictionary[category] || dictionary['Genel'];
        const available = words.filter(w => 
            w.toLocaleLowerCase(TR_CULTURE).startsWith(startingLetter.toLocaleLowerCase(TR_CULTURE)) &&
            !usedWords.map(uw => uw.toLocaleLowerCase(TR_CULTURE)).includes(w.toLocaleLowerCase(TR_CULTURE))
        );

        if (available.length === 0) return null;
        
        return available[Math.floor(Math.random() * available.length)];
    }
};

async function tryValidateWithTdk(word: string): Promise<boolean> {
    try {
        const response = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`, {
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) && data.length > 0;
        }
    } catch (e) {
        console.warn("TDK API connection failed, likely due to CORS. Using local dictionary only.");
    }
    return false;
}
