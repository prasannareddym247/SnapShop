const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDSGf5FqMBRGoLqkLlsRdFCDATvFkuBNnY';

const aiService = {
  async generateImage(prompt) {
    let finalPrompt = prompt;
    if (prompt && typeof prompt === 'string') {
      // Try to extract the product name dynamically from the prompt
      let productName = 'Product';
      if (prompt.includes('SnapShop ')) {
        const parts = prompt.split('SnapShop ');
        if (parts[1]) {
          const endIdx = parts[1].search(/[.\n,']/);
          productName = endIdx !== -1 ? parts[1].substring(0, endIdx).trim() : parts[1].trim();
        }
      } else if (prompt.includes('for SnapShop ')) {
        const parts = prompt.split('for SnapShop ');
        if (parts[1]) {
          const endIdx = parts[1].search(/[.\n,']/);
          productName = endIdx !== -1 ? parts[1].substring(0, endIdx).trim() : parts[1].trim();
        }
      }

      const lower = prompt.toLowerCase();
      const isColorSpecial = lower.includes('red') || 
                             lower.includes('black') || 
                             lower.includes('yellow') || 
                             lower.includes('green') || 
                             lower.includes('orange') || 
                             lower.includes('gold');

      let prefix = `CRITICAL: The printed text on the pouch label MUST read exactly "FRESHKART" at the top and "${productName}" in the center in clear, legible English letters. Do not write gibberish, nonsense symbols, or distorted characters. All letters must be spelled correctly in English. `;
      
      if (isColorSpecial) {
        prefix = `CRITICAL: The product packaging pouch itself must be 100% plain white, with a matte texture. Do NOT color the pouch package itself. It must be solid white. The background must be a wooden counter. ${prefix}`;
      }

      finalPrompt = `${prefix}${prompt}`;
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalPrompt,
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: "1:1"
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Gemini Imagen API error:', data);
        throw new Error(data.error?.message || 'Gemini Imagen API request failed.');
      }

      if (data.generatedImages && data.generatedImages[0]?.image?.imageBytes) {
        return {
          success: true,
          imageUrl: `data:image/jpeg;base64,${data.generatedImages[0].image.imageBytes}`,
          mimeType: 'image/jpeg'
        };
      }

      throw new Error('No image was returned in the Gemini response.');
    } catch (err) {
      console.warn('Gemini Imagen API failed, attempting Pollinations.ai image generator:', err.message);
      
      try {
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true&private=true&model=flux`;
        const response = await fetch(pollinationsUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          console.log('✅ Successfully generated high-quality image via Pollinations.ai!');
          return {
            success: true,
            imageUrl: `data:image/jpeg;base64,${base64}`,
            mimeType: 'image/jpeg'
          };
        }
      } catch (pollinationsErr) {
        console.warn('Pollinations.ai image generation failed, falling back to SVG mockup:', pollinationsErr.message);
      }

      console.warn('Falling back to local SVG mockup generator.');

      const escapeXml = (unsafe) => {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
          }
        });
      };

      // Parse name and category from the prompt
      let name = 'SnapShop Product';
      if (prompt.includes('SnapShop ')) {
        const parts = prompt.split('SnapShop ');
        if (parts[1]) {
          const endIdx = parts[1].search(/[.\n,]/);
          name = endIdx !== -1 ? parts[1].substring(0, endIdx).trim() : parts[1].trim();
        }
      }

      let category = 'Grains';
      const promptLower = prompt.toLowerCase();
      if (
        promptLower.includes('almond') ||
        promptLower.includes('cashew') ||
        promptLower.includes('walnut') ||
        promptLower.includes('raisin') ||
        promptLower.includes('pistachio') ||
        promptLower.includes('date') ||
        promptLower.includes('fig') ||
        promptLower.includes('makhana') ||
        promptLower.includes('coconut') ||
        promptLower.includes('dry fruit') ||
        promptLower.includes('nut')
      ) {
        category = 'Dry Fruits';
      } else if (
        promptLower.includes('cardamom') ||
        promptLower.includes('pepper') ||
        promptLower.includes('clove') ||
        promptLower.includes('cinnamon') ||
        promptLower.includes('spice') ||
        promptLower.includes('coriander') ||
        promptLower.includes('cumin') ||
        promptLower.includes('turmeric') ||
        promptLower.includes('chilli') ||
        promptLower.includes('mustard') ||
        promptLower.includes('fennel')
      ) {
        category = 'Spices';
      }

      const configs = {
        Grains: {
          accent: '#10b981', // green
          grainColor: '#d97706', // gold
          illustration: `
            <!-- Grains pile and stalks inside circle -->
            <path d="M400 530c15-20 35-25 50-25s35 5 50 25z" fill="#d97706" opacity="0.9"/>
            <g stroke="#047857" stroke-width="3" fill="none" stroke-linecap="round">
              <path d="M450 515c-10-18-5-38-5-38s5 15 5 38"/>
              <path d="M435 520c-15-15-18-30-18-30s12 10 18 30"/>
              <path d="M465 520c15-15 18-30 18-30s-12 10-18 30"/>
            </g>
          `,
          subtitle: 'Grains & Millets'
        },
        'Dry Fruits': {
          accent: '#d4af37', // gold
          grainColor: '#92400e', // brown
          illustration: `
            <!-- Almond pile inside circle -->
            <path d="M395 530c15-25 35-30 55-30s40 5 55 25z" fill="#92400e" opacity="0.9"/>
            <g fill="#f59e0b" stroke="#78350f" stroke-width="1.5">
              <path d="M435 520c5-10 15-15 20-15s15 5 20 15-5 15-20 15-15-8-20-15z"/>
              <path d="M455 535c5-10 15-15 20-15s15 5 20 15-5 15-20 15-15-8-20-15z" transform="rotate(20 465 535)"/>
            </g>
          `,
          subtitle: 'Healthy Nuts'
        },
        Spices: {
          accent: '#b91c1c', // red
          grainColor: '#047857', // forest green
          illustration: `
            <!-- Spices illustration inside circle -->
            <path d="M400 530c15-20 35-25 50-25s35 5 50 25z" fill="#b91c1c" opacity="0.9"/>
            <g stroke="#047857" stroke-width="3" fill="none">
              <path d="M450 510c-5-15-15-25-15-25s15 5 15 25"/>
              <path d="M450 510c5-15 15-25 15-25s-15 5-15 25"/>
            </g>
          `,
          subtitle: 'Aromatic Spices'
        }
      };

      const config = configs[category] || configs['Grains'];
      const nameUpper = name.toUpperCase();
      const escapedName = escapeXml(name);
      const escapedSubtitle = escapeXml(config.subtitle);
      
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
          <defs>
            <!-- Wall gradient (kitchen background) -->
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f3f4f6"/>
              <stop offset="100%" stop-color="#e5e7eb"/>
            </linearGradient>
            
            <!-- Table gradient -->
            <linearGradient id="tableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#d8cfc4"/>
              <stop offset="20%" stop-color="#e5ded4"/>
              <stop offset="100%" stop-color="#c4b8aa"/>
            </linearGradient>
            
            <!-- White matte pouch gradient -->
            <linearGradient id="pouchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="70%" stop-color="#faf9f6"/>
              <stop offset="100%" stop-color="#e5e5df"/>
            </linearGradient>
            
            <!-- Ground shadow under pouch -->
            <radialGradient id="pouchShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#0f172a" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
            </radialGradient>
          </defs>
          
          <!-- 1. Background Scene (Blurred Kitchen) -->
          <!-- Kitchen Wall -->
          <rect width="1024" height="360" fill="url(#wallGrad)"/>
          <!-- Soft window reflection overlay -->
          <rect x="100" y="40" width="180" height="240" fill="#ffffff" opacity="0.2" rx="10"/>
          
          <!-- Kitchen Counter/Table (Wood-style Tan) -->
          <rect y="360" width="1024" height="152" fill="url(#tableGrad)"/>
          <line x1="0" y1="360" x2="1024" y2="360" stroke="#b1a699" stroke-width="4"/>
          
          <!-- Glass Jar on the Left Table -->
          <g transform="translate(220, 290)" opacity="0.85">
            <!-- Jar body shadow -->
            <rect x="0" y="4" width="60" height="80" rx="10" fill="#000000" opacity="0.05"/>
            <!-- Content grains inside jar -->
            <rect x="4" y="25" width="52" height="51" rx="4" fill="${config.grainColor}" opacity="0.7"/>
            <!-- Glass Jar Outline -->
            <rect x="0" y="0" width="60" height="80" rx="10" fill="none" stroke="#94a3b8" stroke-width="2"/>
            <rect x="12" y="-8" width="36" height="8" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
          </g>
          
          <!-- Ceramic Bowl on the Right Table -->
          <g transform="translate(720, 335)" opacity="0.85">
            <!-- Grains pile in bowl -->
            <path d="M10 25c15-20 45-20 60 0z" fill="${config.grainColor}"/>
            <!-- Ceramic Bowl -->
            <path d="M0 25c0 22 18 40 40 40h0c22 0 40-18 40-40H0z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
          </g>
          
          <!-- 2. Centered Stand-Up Pouch -->
          <g transform="translate(130, -50)">
            <!-- Pouch drop shadow -->
            <ellipse cx="382" cy="465" rx="140" ry="18" fill="url(#pouchShadow)"/>
            
            <!-- Pouch Shape -->
            <path d="M260 120h244l28 320c2 30-24 55-54 55H286c-30 0-56-25-54-55l28-320z" fill="url(#pouchGrad)" stroke="#000000" stroke-opacity="0.08" stroke-width="3"/>
            
            <!-- Zipper ridge grooves at top of pouch -->
            <line x1="263" y1="150" x2="501" y2="150" stroke="#000000" stroke-opacity="0.12" stroke-width="3" stroke-dasharray="6 4"/>
            <line x1="264" y1="156" x2="500" y2="156" stroke="#000000" stroke-opacity="0.08" stroke-width="1.5"/>
            
            <!-- Geometric Triangle accents on the left and right sides -->
            <polygon points="261 180, 290 200, 270 280" fill="${config.accent}" fill-opacity="0.15"/>
            <polygon points="503 260, 475 285, 495 350" fill="${config.accent}" fill-opacity="0.15"/>
            <polygon points="274 380, 295 390, 280 430" fill="${config.accent}" fill-opacity="0.15"/>
            
            <!-- Veg / Non-Veg Green Circle Logo -->
            <g transform="translate(470, 168)" scale="0.8">
              <rect width="16" height="16" fill="none" stroke="#15803d" stroke-width="2"/>
              <circle cx="8" cy="8" r="4" fill="#15803d"/>
            </g>
            
            <!-- Brand Identity Header -->
            <g transform="translate(382, 195)">
              <!-- Leaf Icon -->
              <circle cx="-65" cy="-8" r="12" fill="#15803d" fill-opacity="0.15"/>
              <path d="M-72 -8c2-4 6-6 10-6s4 4 2 8-6 6-10 6-4-4-2-8" fill="#15803d"/>
              <!-- Brand Name Text -->
              <text x="-48" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#134e5e" letter-spacing="1">FRESHKART</text>
              <!-- Subtitle -->
              <text x="0" y="14" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7" font-weight="700" fill="#134e5e" opacity="0.6">Purely Natural • Freshly Packed</text>
            </g>
            
            <!-- Product Title Center -->
            <g transform="translate(382, 255)">
              <text x="0" y="0" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#115e59" letter-spacing="1.5">${escapedName}</text>
              <text x="0" y="16" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#115e59" opacity="0.75">${escapedSubtitle}</text>
            </g>
            
            <!-- Circle Frame for Illustration -->
            <circle cx="382" cy="340" r="54" fill="#ffffff" stroke="#15803d" stroke-width="1.5" stroke-opacity="0.25"/>
            <!-- Stalk / grain visual illustration inside circle -->
            <g transform="translate(-68, -165)">
              ${config.illustration}
            </g>
            
            <!-- Bottom banner weights and details -->
            <line x1="280" y1="416" x2="484" y2="416" stroke="#000000" stroke-opacity="0.08" stroke-width="1"/>
            <text x="282" y="432" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#1e293b" opacity="0.8">PREMIUM QUALITY • WHOLE &amp; NATURAL</text>
            <text x="482" y="432" text-anchor="end" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#1e293b" opacity="0.8">1 kg e</text>
          </g>
        </svg>
      `;
      
      return {
        success: true,
        imageUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        mimeType: 'image/svg+xml'
      };
    }
  },

  async generateContent(name, category) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate e-commerce catalog product details for a product named "${name}" in the category "${category}". 
                The response MUST be a JSON object containing:
                - name: product name
                - description: a rich, professional, appealing description (2-3 sentences)
                - bullets: array of 4 bullet points representing key features
                - storageInstructions: clear storage guidelines
                - imagePrompt: a detailed, highly descriptive prompt to generate a product packaging photo. It MUST follow this template format exactly:
                  "A premium, sleek modern stand-up pouch packaging design for SnapShop {productName}. The pouch label has a clean cream background with elegant minimalist pastel geometric shapes in soft light green and tan/beige. At the top, it displays a professional circular green leaf brand logo and the brand name 'FRESHKART' in a clean modern sans-serif font. In the center, the product name '{productNameUpper}' is printed in very large, bold, crisp dark green uppercase typography. Below the name, a beautiful, clean, minimal artistic graphic illustration of a mound of raw {illustrationSubject} grains and plant stalks is centered. At the bottom, it says 'PREMIUM {productNameUpper} • WHOLE & NATURAL' in small clean letters. The pouch is placed vertically in the center on a light-wood kitchen table in a bright, modern, softly blurred kitchen. In the background, a small glass jar sits on the left and a small ceramic bowl sits on the right, both filled with {illustrationSubject}. Soft natural lighting, professional commercial product photography, 8k resolution."
                  Ensure that you replace {productName} with the actual product name, {productNameUpper} with the uppercase product name, and {illustrationSubject} with the name of the main ingredient/subject of the product.
                Ensure the output is valid JSON, with no markdown code block backticks.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Gemini content generation error:', data);
        throw new Error(data.error?.message || 'Gemini content API failed.');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No content returned from Gemini.');
      }

      // Clean up text if Gemini wrapped it in markdown code block
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanText);
      return {
        success: true,
        content: parsed
      };
    } catch (err) {
      console.warn('Gemini content generation failed, falling back to mock content generator:', err.message);
      
      // Mock content tailored to category and name
      const bullets = {
        Grains: [
          "Premium grade product sourced directly from optimal agricultural fields",
          "Rich source of dietary fiber, complex carbs, and essential minerals",
          "Hygienically sorted and packed to ensure absolute purity and consistency",
          "Perfect for daily home meals, traditional recipes, and healthy diets"
        ],
        "Dry Fruits": [
          "Handpicked premium quality dried nuts rich in natural oils and nutrients",
          "Packed with heart-healthy monounsaturated fats, dietary fiber, and vitamins",
          "Naturally sweet and crunchy, serving as an exceptional guilt-free energy snack",
          "Preserved under ideal low-moisture conditions to maintain crunch and freshness"
        ],
        Spices: [
          "100% pure ground spices processed from the finest aromatic pods and seeds",
          "Exquisite flavor profile and high concentration of natural volatile oils",
          "Hygienically milled at low temperature to retain natural color and aroma",
          "Adds rich, traditional taste and depth to both authentic and modern recipes"
        ]
      }[category] || [
        "100% natural, premium quality select ingredients",
        "Rich in essential vitamins, plant-based proteins, and healthy minerals",
        "Processed and packed under strict quality control standards",
        "Highly versatile and perfectly suited for various home recipes"
      ];

      return {
        success: true,
        content: {
          name: name,
          description: `SnapShop Premium ${name} is a select premium product within our ${category} catalog. Handpicked and sourced from optimal regions, it delivers an exquisite aroma, rich texture, and high nutritional value. Aged and processed to perfection, it is the ideal addition to your family's wholesome diet.`,
          bullets: bullets,
          storageInstructions: "Store in a cool, dry, and hygienic place in an airtight container away from moisture.",
          imagePrompt: `Premium grocery packaging pouch design for SnapShop ${name}. The pouch label has a clean cream background with elegant minimalist pastel geometric shapes in soft light green and tan/beige. At the top, it displays a professional circular green leaf brand logo and the brand name 'FRESHKART' in a clean modern sans-serif font. In the center, the product name '${name.toUpperCase()}' is printed in very large, bold, crisp dark green uppercase typography. Below the name, a beautiful, clean, minimal artistic graphic illustration of a mound of raw ${name} and plant stalks is centered. The package is a sleek matte-finish stand-up pouch. The pouch is placed vertically in the center on a light-wood kitchen table inside a bright, modern, softly blurred kitchen. In the background, a glass jar filled with ${name} sits on the left and a ceramic bowl filled with ${name} sits on the right. Soft natural lighting, professional commercial product photography, 8k resolution.`
        }
      };
    }
  }
};

module.exports = aiService;
