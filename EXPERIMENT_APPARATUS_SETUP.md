# 🧪 Experiment-Specific Apparatus Setup

## Overview
The lab now automatically sets up the correct apparatus and reagents on the table based on which experiment is selected!

---

## 🎯 **HOW IT WORKS:**

When you select an experiment, the system automatically:
1. **Detects** which experiment you chose
2. **Clears** the table
3. **Places** the exact apparatus and reagents needed
4. **Ready** to start the experiment!

---

## 🔬 **EXPERIMENT 1: ACID-BASE TITRATION**

### **Apparatus on Table:**

1. **HCl Solution** (Red Flask)
   - Position: Left side
   - 0.6 fill level
   - Red liquid color
   - Hydrochloric acid

2. **NaOH Solution** (Purple Graduated Cylinder)
   - Position: Center-left
   - 0.7 fill level
   - Purple liquid
   - Sodium hydroxide

3. **Phenolphthalein Indicator** (Yellow Beaker)
   - Position: Center
   - 0.3 fill level
   - Yellow/amber color
   - pH indicator

4. **Distilled Water** (Blue Beaker)
   - Position: Center-right
   - 0.8 fill level
   - Blue liquid
   - For rinsing

5. **Conical Flask** (Red, Draggable)
   - Position: Right side
   - Empty
   - For titration

6. **Burette** (Purple, Draggable)
   - Position: Far right
   - Tall graduated tube
   - Volume markings: 0-40 mL
   - For precise NaOH delivery

### **Equipment:**
- Analytical Balance
- Ring Stand
- Hotplate

---

## 🧪 **EXPERIMENT 2: ACIDITY TESTING**

### **Apparatus on Table:**

1. **Unknown Solution A** (Red Beaker - Acidic)
   - Position: Left
   - 0.6 fill level
   - Red liquid
   - pH ~3.5

2. **Unknown Solution B** (Blue Beaker - Neutral)
   - Position: Center
   - 0.6 fill level
   - Blue liquid
   - pH ~7.0

3. **Unknown Solution C** (Green Beaker - Alkaline)
   - Position: Right
   - 0.6 fill level
   - Green liquid
   - pH ~10.5

4. **pH Paper Strips** (Yellow Box)
   - Position: Far right
   - For quick pH testing
   - Color chart included

5. **Empty Beaker** (Blue, Draggable)
   - Position: Center-left
   - For testing samples
   - Transparent glass

### **Equipment:**
- Digital pH Meter (Thermometer position)
- Analytical Balance

---

## ⚗️ **EXPERIMENT 3: CHEMICAL REACTION TEST (H₂O₂ + KMnO₄)**

### **Apparatus on Table:**

1. **Hydrogen Peroxide** (Light Blue Beaker)
   - Position: Left
   - 3% H₂O₂ solution
   - 0.5 fill level
   - Clear/pale blue liquid
   - 50 mL

2. **Potassium Permanganate** (Purple Flask)
   - Position: Center-left
   - 0.1M KMnO₄
   - 0.4 fill level
   - Deep purple liquid
   - 5 mL

3. **Syringe/Dropper** (Gray)
   - Position: Center
   - For precise liquid transfer
   - Transparent plastic
   - Graduated markings

4. **Spatula/Scoop** (Silver)
   - Position: Center-right
   - Metal spatula
   - For solid chemicals
   - Stainless steel

5. **Conical Flask** (Red, Draggable)
   - Position: Right
   - Empty
   - For mixing reaction
   - 250 mL capacity

### **Equipment:**
- Digital Thermometer (for temperature monitoring)
- Analytical Balance

---

## 📊 **APPARATUS COMPARISON:**

| Apparatus | Titration | Acidity | Reaction |
|-----------|-----------|---------|----------|
| **HCl Solution** | ✅ | ❌ | ❌ |
| **NaOH Solution** | ✅ | ❌ | ❌ |
| **Indicator** | ✅ | ❌ | ❌ |
| **Distilled Water** | ✅ | ❌ | ❌ |
| **Unknown A (Acidic)** | ❌ | ✅ | ❌ |
| **Unknown B (Neutral)** | ❌ | ✅ | ❌ |
| **Unknown C (Alkaline)** | ❌ | ✅ | ❌ |
| **pH Paper** | ❌ | ✅ | ❌ |
| **H₂O₂ Solution** | ❌ | ❌ | ✅ |
| **KMnO₄ Solution** | ❌ | ❌ | ✅ |
| **Syringe** | ❌ | ❌ | ✅ |
| **Spatula** | ❌ | ❌ | ✅ |
| **Conical Flask** | ✅ | ❌ | ✅ |
| **Burette** | ✅ | ❌ | ❌ |
| **Empty Beaker** | ❌ | ✅ | ❌ |
| **pH Meter** | ❌ | ✅ | ❌ |
| **Thermometer** | ❌ | ❌ | ✅ |
| **Balance** | ✅ | ✅ | ✅ |

---

## 🎮 **HOW TO USE:**

### **Step 1: Select Experiment**
1. Click **"EXPERIMENTS"** button (top-right, purple)
2. Choose one of three experiments:
   - Acid-Base Titration
   - Acidity Testing
   - Chemical Reaction Test

### **Step 2: Automatic Setup**
- Table **automatically clears**
- **Correct apparatus** appears
- **Reagents** are pre-filled
- **Equipment** is positioned

### **Step 3: Start Experiment**
- All materials are ready
- Follow experiment steps
- Use apparatus as needed
- Complete the experiment!

---

## 🔧 **TECHNICAL IMPLEMENTATION:**

### **Detection Logic:**
```typescript
const getExperimentApparatus = () => {
  if (!currentExperiment) return 'none';
  
  if (currentExperiment.includes('titration')) return 'titration';
  if (currentExperiment.includes('acidity')) return 'acidity';
  if (currentExperiment.includes('reaction')) return 'reaction';
  
  return 'none';
};
```

### **Conditional Rendering:**
```typescript
{experimentType === 'titration' && (
  <>
    {/* Titration-specific apparatus */}
    <PhysicsLabItem ... />
    <DraggableApparatus ... />
  </>
)}

{experimentType === 'acidity' && (
  <>
    {/* Acidity-specific apparatus */}
  </>
)}

{experimentType === 'reaction' && (
  <>
    {/* Reaction-specific apparatus */}
  </>
)}
```

---

## 📍 **APPARATUS POSITIONS:**

### **Titration:**
- HCl: `[-0.8, 1.1, -1.5]`
- NaOH: `[-0.3, 1.1, -1.5]`
- Indicator: `[0.2, 1.1, -1.5]`
- Water: `[0.7, 1.1, -1.5]`
- Flask: `[1.3, 1.15, -1.5]`
- Burette: `[1.9, 1.35, -1.5]`

### **Acidity:**
- Unknown A: `[-0.9, 1.1, -1.5]`
- Unknown B: `[-0.3, 1.1, -1.5]`
- Unknown C: `[0.3, 1.1, -1.5]`
- pH Paper: `[0.9, 1.05, -1.5]`
- Beaker: `[-0.5, 1.15, -1.5]`
- pH Meter: `[1.5, 0.95, -1.5]`

### **Reaction:**
- H₂O₂: `[-0.8, 1.1, -1.5]`
- KMnO₄: `[-0.2, 1.1, -1.5]`
- Syringe: `[0.4, 1.05, -1.5]`
- Spatula: `[0.9, 1.02, -1.5]`
- Flask: `[1.3, 1.15, -1.5]`
- Thermometer: `[1.4, 0.95, -1.5]`

---

## 🎨 **COLOR CODING:**

### **Titration:**
- 🔴 **Red** - HCl (acid)
- 🟣 **Purple** - NaOH (base)
- 🟡 **Yellow** - Indicator
- 🔵 **Blue** - Water
- 🔴 **Red Flask** - For titration
- 🟣 **Purple Burette** - For NaOH delivery

### **Acidity:**
- 🔴 **Red** - Acidic solution
- 🔵 **Blue** - Neutral solution
- 🟢 **Green** - Alkaline solution
- 🟡 **Yellow** - pH paper
- 🔵 **Blue Beaker** - Testing vessel

### **Reaction:**
- 🔵 **Light Blue** - H₂O₂ (oxidizer)
- 🟣 **Purple** - KMnO₄ (oxidizer)
- ⚪ **Gray** - Syringe
- ⚪ **Silver** - Spatula
- 🔴 **Red Flask** - Reaction vessel

---

## ✨ **FEATURES:**

### **Automatic:**
✅ Detects experiment type  
✅ Clears previous apparatus  
✅ Places correct items  
✅ Pre-fills reagents  
✅ Positions equipment  

### **Interactive:**
✅ All apparatus clickable  
✅ Draggable items  
✅ Realistic physics  
✅ Visual feedback  
✅ Labels visible  

### **Realistic:**
✅ Correct volumes  
✅ Proper colors  
✅ Accurate positions  
✅ Real equipment  
✅ Safe setup  

---

## 📝 **FILES MODIFIED:**

1. **`client/src/components/Scene.tsx`**
   - Added `currentExperiment` from useLabTraining
   - Created `getExperimentApparatus()` function
   - Added conditional rendering for each experiment
   - Removed old static apparatus
   - Added experiment-specific reagents
   - Added new apparatus (syringe, spatula, pH paper)

---

## 🎓 **FOR YOUR DISSERTATION:**

### **Benefits:**

1. **Realistic Lab Experience:**
   - Students see only what they need
   - No clutter or confusion
   - Proper lab organization

2. **Educational Value:**
   - Learn what apparatus each experiment needs
   - Understand reagent selection
   - Practice lab setup

3. **Safety:**
   - Only relevant chemicals present
   - Reduces errors
   - Clear labeling

4. **Efficiency:**
   - No manual setup required
   - Instant experiment start
   - Focus on learning

---

## 🚀 **TESTING:**

### **Test Each Experiment:**

1. **Titration:**
   - Select "Acid-Base Titration"
   - Check for: HCl, NaOH, Indicator, Water, Flask, Burette
   - All should be visible

2. **Acidity:**
   - Select "Acidity Testing"
   - Check for: 3 unknown solutions, pH paper, pH meter, beaker
   - All should be visible

3. **Reaction:**
   - Select "Chemical Reaction Test"
   - Check for: H₂O₂, KMnO₄, syringe, spatula, flask, thermometer
   - All should be visible

---

## 📊 **SUMMARY:**

| Feature | Status |
|---------|--------|
| **Auto-detection** | ✅ Working |
| **Titration setup** | ✅ Complete |
| **Acidity setup** | ✅ Complete |
| **Reaction setup** | ✅ Complete |
| **Conditional rendering** | ✅ Working |
| **Hot reload** | ✅ Applied |
| **All apparatus** | ✅ Positioned |
| **All reagents** | ✅ Pre-filled |

---

**Refresh browser and select any experiment - the table will automatically set up with the exact apparatus needed!** 🧪✨
