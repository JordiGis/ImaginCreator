// Character Appearance Configurator — trait definitions
// Each category has a key, label, and options array.
// prompt value = fragment inserted into the composed prompt.

export const TRAIT_CATEGORIES = [
  // ── Identity ──
  {
    key: 'race',
    label: 'Raza',
    icon: '🌍',
    options: [
      { id: 'human',     label: 'Humano',      prompt: 'human' },
      { id: 'elf',       label: 'Elfo',        prompt: 'elf' },
      { id: 'half-elf',  label: 'Semi-Elfo',   prompt: 'half-elf' },
      { id: 'dwarf',     label: 'Enano',       prompt: 'dwarf' },
      { id: 'orc',       label: 'Orco',        prompt: 'orc' },
      { id: 'half-orc',  label: 'Semi-Orco',   prompt: 'half-orc' },
      { id: 'tiefling',  label: 'Tiefling',    prompt: 'tiefling' },
      { id: 'dragonborn',label: 'Dragonborn',  prompt: 'dragonborn' },
      { id: 'gnome',     label: 'Gnomo',       prompt: 'gnome' },
      { id: 'halfling',  label: 'Mediano',     prompt: 'halfling' },
      { id: 'angel',     label: 'Ángel',       prompt: 'angel' },
      { id: 'demon',     label: 'Demonio',     prompt: 'demon' },
      { id: 'fairy',     label: 'Hada',        prompt: 'fairy' },
      { id: 'vampire',   label: 'Vampiro',     prompt: 'vampire' },
      { id: 'werewolf',  label: 'Hombre Lobo', prompt: 'werewolf' },
      { id: 'undead',    label: 'No-muerto',   prompt: 'undead' },
      { id: 'robot',     label: 'Robot/Cyborg',prompt: 'cyborg' },
      { id: 'naga',      label: 'Naga',        prompt: 'naga' },
      { id: 'merfolk',   label: 'Merfolk',     prompt: 'merfolk' },
      { id: 'goblin',    label: 'Goblin',      prompt: 'goblin' },
    ],
  },
  {
    key: 'gender',
    label: 'Género',
    icon: '⚧️',
    options: [
      { id: 'male',         label: 'Masculino',    prompt: 'male' },
      { id: 'female',       label: 'Femenino',     prompt: 'female' },
      { id: 'trans_woman',  label: 'Mujer Trans',  prompt: 'trans woman' },
      { id: 'trans_man',    label: 'Hombre Trans', prompt: 'trans man' },
      { id: 'andro',        label: 'Andrógino',    prompt: 'androgynous' },
      { id: 'non_binary',   label: 'No binario',   prompt: 'non-binary' },
    ],
  },
  {
    key: 'age',
    label: 'Edad',
    icon: '🎂',
    options: [
      { id: 'child',    label: 'Niño/a',     prompt: 'child' },
      { id: 'teen',     label: 'Adolescente', prompt: 'teenage' },
      { id: 'young',    label: 'Joven',      prompt: 'young adult' },
      { id: 'adult',    label: 'Adulto',     prompt: 'adult' },
      { id: 'middle',   label: 'Maduro',     prompt: 'middle-aged' },
      { id: 'elderly',  label: 'Anciano',    prompt: 'elderly' },
      { id: 'ancient',  label: 'Ancestral',  prompt: 'ancient timeless' },
    ],
  },

  // ── Facial Hair ──
  {
    key: 'facialHair',
    label: 'Vello Facial',
    icon: '🧔',
    options: [
      { id: 'none',        label: 'Ninguno',     prompt: '' },
      { id: 'stubble',     label: 'Barba días',  prompt: 'with stubble' },
      { id: 'light_beard', label: 'Barba corta', prompt: 'with a short trimmed beard' },
      { id: 'full_beard',  label: 'Barba larga', prompt: 'with a full long beard' },
      { id: 'goatee',      label: 'Perilla',     prompt: 'with a goatee' },
      { id: 'mustache',    label: 'Bigote',      prompt: 'with a mustache' },
      { id: 'soul_patch',  label: 'Soul patch',  prompt: 'with a soul patch' },
      { id: 'mutton_chops',label: 'Patillas',    prompt: 'with mutton chops sideburns' },
      { id: 'van_dyke',    label: 'Van Dyke',    prompt: 'with a van dyke beard' },
      { id: 'clean',       label: 'Rasurado',    prompt: 'clean-shaven' },
    ],
  },

  // ── Face ──
  {
    key: 'faceShape',
    label: 'Forma de Cara',
    icon: '🔵',
    options: [
      { id: 'oval',      label: 'Ovalada',    prompt: 'oval face' },
      { id: 'round',     label: 'Redonda',    prompt: 'round face' },
      { id: 'square',    label: 'Cuadrada',   prompt: 'square face' },
      { id: 'heart',     label: 'Corazón',    prompt: 'heart-shaped face' },
      { id: 'diamond',   label: 'Diamante',   prompt: 'diamond-shaped face' },
      { id: 'long',      label: 'Alargada',   prompt: 'long face' },
      { id: 'triangular',label: 'Triangular', prompt: 'triangular face' },
    ],
  },
  {
    key: 'eyeShape',
    label: 'Forma de Ojos',
    icon: '👁️',
    options: [
      { id: 'almond',    label: 'Almendrados',   prompt: 'almond-shaped' },
      { id: 'round',     label: 'Redondos',      prompt: 'large round' },
      { id: 'hooded',    label: 'Con párpado',   prompt: 'hooded' },
      { id: 'monolid',   label: 'Monolid',       prompt: 'monolid' },
      { id: 'upturned',  label: 'Elevados',      prompt: 'upturned' },
      { id: 'downturned',label: 'Caídos',        prompt: 'downturned' },
      { id: 'narrow',    label: 'Estrechos',     prompt: 'narrow' },
    ],
  },
  {
    key: 'eyeColor',
    label: 'Color de Ojos',
    icon: '🎨',
    options: [
      { id: 'blue',    label: 'Azules',    prompt: 'blue' },
      { id: 'green',   label: 'Verdes',    prompt: 'green' },
      { id: 'brown',   label: 'Marrones',  prompt: 'brown' },
      { id: 'hazel',   label: 'Avellana',  prompt: 'hazel' },
      { id: 'grey',    label: 'Grises',    prompt: 'grey' },
      { id: 'amber',   label: 'Ámbar',     prompt: 'amber' },
      { id: 'red',     label: 'Rojos',     prompt: 'red' },
      { id: 'violet',  label: 'Violeta',   prompt: 'violet' },
      { id: 'black',   label: 'Negros',    prompt: 'black' },
      { id: 'silver',  label: 'Plateados', prompt: 'silver' },
      { id: 'gold',    label: 'Dorados',   prompt: 'golden' },
      { id: 'white',   label: 'Blancos',   prompt: 'white pale' },
      { id: 'glowing', label: 'Brillantes',prompt: 'glowing luminous' },
    ],
  },
  {
    key: 'nose',
    label: 'Nariz',
    icon: '👃',
    options: [
      { id: 'straight', label: 'Recta',      prompt: 'straight' },
      { id: 'button',   label: 'Pequena',    prompt: 'button' },
      { id: 'aquiline', label: 'Aguileña',   prompt: 'aquiline' },
      { id: 'wide',     label: 'Ancha',      prompt: 'wide' },
      { id: 'flat',     label: 'Chata',      prompt: 'flat' },
      { id: 'pointed',  label: 'Fina',       prompt: 'pointed sharp' },
      { id: 'upturned', label: 'Respingona', prompt: 'upturned' },
      { id: 'roman',    label: 'Romana',     prompt: 'roman' },
    ],
  },
  {
    key: 'lips',
    label: 'Labios',
    icon: '👄',
    options: [
      { id: 'thin',    label: 'Finos',    prompt: 'thin' },
      { id: 'medium',  label: 'Medios',   prompt: 'medium' },
      { id: 'full',    label: 'Gruesos',  prompt: 'full' },
      { id: 'heart',   label: 'Corazón',  prompt: 'heart-shaped' },
      { id: 'wide',    label: 'Anchos',   prompt: 'wide' },
    ],
  },

  // ── Expression ──
  {
    key: 'expression',
    label: 'Expresión',
    icon: '😊',
    options: [
      { id: 'neutral',    label: 'Neutra',      prompt: 'neutral expression' },
      { id: 'smiling',    label: 'Sonriente',   prompt: 'warm smile' },
      { id: 'serious',    label: 'Serio',       prompt: 'serious stern expression' },
      { id: 'angry',      label: 'Enfadado',    prompt: 'angry fierce expression' },
      { id: 'sad',        label: 'Triste',      prompt: 'sad melancholic expression' },
      { id: 'happy',      label: 'Feliz',       prompt: 'happy joyful expression' },
      { id: 'surprised',  label: 'Sorprendido', prompt: 'surprised expression' },
      { id: 'confident',  label: 'Confiado',    prompt: 'confident determined expression' },
      { id: 'mysterious', label: 'Misterioso',  prompt: 'mysterious enigmatic expression' },
      { id: 'menacing',   label: 'Amenazante',  prompt: 'menacing intimidating glare' },
      { id: 'playful',    label: 'Juguetón',    prompt: 'playful mischievous expression' },
      { id: 'seductive',  label: 'Seductor',    prompt: 'seductive alluring expression' },
      { id: 'disgusted',  label: 'Disgustado',  prompt: 'disgusted expression' },
      { id: 'crying',     label: 'Llorando',    prompt: 'crying tearful expression' },
    ],
  },

  // ── Hair ──
  {
    key: 'hairStyle',
    label: 'Estilo de Pelo',
    icon: '💇',
    options: [
      { id: 'bald',      label: 'Calvo',       prompt: 'bald' },
      { id: 'short',     label: 'Corto',       prompt: 'short' },
      { id: 'medium_len',label: 'Media melena', prompt: 'medium-length' },
      { id: 'long',      label: 'Largo',       prompt: 'long flowing' },
      { id: 'straight',  label: 'Lacio',       prompt: 'straight' },
      { id: 'wavy',      label: 'Ondulado',    prompt: 'wavy' },
      { id: 'curly',     label: 'Rizado',      prompt: 'curly' },
      { id: 'coily',     label: 'Afro',        prompt: 'coily afro-textured' },
      { id: 'ponytail',  label: 'Coleta',      prompt: 'ponytail' },
      { id: 'bun',       label: 'Moño',        prompt: 'bun' },
      { id: 'braids',    label: 'Trenzas',     prompt: 'braided' },
      { id: 'dreads',    label: 'Rastas',      prompt: 'dreadlocks' },
      { id: 'mohawk',    label: 'Mohawk',      prompt: 'mohawk' },
      { id: 'pixie',     label: 'Pixie',       prompt: 'pixie cut' },
      { id: 'bob',       label: 'Bob',         prompt: 'bob haircut' },
      { id: 'shaved',    label: 'Rapado',      prompt: 'shaved head' },
      { id: 'topknot',   label: 'Rodete',      prompt: 'topknot man bun' },
      { id: 'undercut',  label: 'Undercut',    prompt: 'undercut' },
    ],
  },
  {
    key: 'hairColor',
    label: 'Color de Pelo',
    icon: '🟤',
    options: [
      { id: 'blonde',  label: 'Rubio',       prompt: 'blonde' },
      { id: 'brown',   label: 'Castaño',     prompt: 'brown' },
      { id: 'black',   label: 'Negro',       prompt: 'black' },
      { id: 'red',     label: 'Pelirrojo',   prompt: 'red' },
      { id: 'ginger',  label: 'Pelirrojo vivo',prompt: 'ginger' },
      { id: 'white',   label: 'Blanco/Gris', prompt: 'white or grey' },
      { id: 'blue',    label: 'Azul',        prompt: 'bright blue' },
      { id: 'green',   label: 'Verde',       prompt: 'bright green' },
      { id: 'pink',    label: 'Rosa',        prompt: 'pink' },
      { id: 'purple',  label: 'Púrpura',     prompt: 'purple' },
      { id: 'silver',  label: 'Plateado',    prompt: 'silver metallic' },
      { id: 'gold',    label: 'Dorado',      prompt: 'golden' },
      { id: 'rainbow', label: 'Arcoíris',    prompt: 'rainbow multicolor' },
    ],
  },

  // ── Skin ──
  {
    key: 'skinTone',
    label: 'Tono de Piel',
    icon: '✋',
    options: [
      { id: 'pale',   label: 'Pálido',   prompt: 'pale white' },
      { id: 'light',  label: 'Claro',    prompt: 'light' },
      { id: 'medium', label: 'Medio',    prompt: 'medium' },
      { id: 'tan',    label: 'Bronceado',prompt: 'tan olive' },
      { id: 'dark',   label: 'Oscuro',   prompt: 'dark' },
      { id: 'ebony',  label: 'Ébano',    prompt: 'ebony black' },
    ],
  },
  {
    key: 'skinFeature',
    label: 'Rasgos de Piel',
    icon: '✨',
    options: [
      { id: 'none',     label: 'Ninguno',      prompt: '' },
      { id: 'freckles', label: 'Pecas',        prompt: ', freckled' },
      { id: 'scars',    label: 'Cicatrices',   prompt: ', scarred' },
      { id: 'tattoos',  label: 'Tatuajes',     prompt: ', with facial tattoos' },
      { id: 'glowing',  label: 'Brillo',       prompt: ', glowing radiant' },
      { id: 'scales',   label: 'Escamas',      prompt: ', scaly' },
      { id: 'metallic', label: 'Metálico',    prompt: ', metallic skin' },
      { id: 'vitiligo', label: 'Vitíligo',    prompt: ', with vitiligo patches' },
      { id: 'ruddy',    label: 'Rubicundo',   prompt: ', ruddy complexion' },
    ],
  },

  // ── Adult Features (multi-select) ──
  {
    key: 'adultFeatures',
    label: 'Rasgos de Adulto',
    icon: '🔞',
    multi: true,
    options: [
      { id: 'body_hair',   label: 'Vello corporal',  prompt: 'with body hair' },
      { id: 'makeup',      label: 'Maquillaje',      prompt: 'wearing makeup' },
      { id: 'makeup_heavy',label: 'Maquillaje fuerte',prompt: 'wearing heavy dramatic makeup' },
      { id: 'lipstick',    label: 'Pintalabios',     prompt: 'wearing lipstick' },
      { id: 'eyeliner',    label: 'Delineado',       prompt: 'with eyeliner' },
      { id: 'wrinkles',    label: 'Arrugas',         prompt: 'with wrinkles and age lines' },
      { id: 'beauty_mark', label: 'Lunar',           prompt: 'with a beauty mark' },
      { id: 'adams_apple', label: 'Nuez prominente', prompt: 'with prominent Adam\'s apple' },
      { id: 'rosy_cheeks', label: 'Mejillas rojizas',prompt: 'with rosy cheeks' },
      { id: 'blush',       label: 'Colorete',        prompt: 'wearing blush' },
      { id: 'eyeshadow',   label: 'Sombra ojos',     prompt: 'wearing eyeshadow' },
      { id: 'scar_brow',   label: 'Cicatriz ceja',   prompt: 'with a scar through the eyebrow' },
      { id: 'bloodshot',   label: 'Ojos inyectados', prompt: 'with bloodshot eyes' },
      { id: 'dark_circles',label: 'Ojeras',          prompt: 'with dark circles under eyes' },
    ],
  },

  // ── Body ──
  {
    key: 'bodyType',
    label: 'Tipo de Cuerpo',
    icon: '💪',
    options: [
      { id: 'slim',     label: 'Delgado',   prompt: 'slim' },
      { id: 'athletic', label: 'Atlético',  prompt: 'athletic toned' },
      { id: 'muscular', label: 'Musculoso', prompt: 'muscular' },
      { id: 'curvy',    label: 'Curvas',    prompt: 'curvy' },
      { id: 'petite',   label: 'Pequeño',   prompt: 'petite' },
      { id: 'broad',    label: 'Robusto',   prompt: 'broad heavy set' },
    ],
  },
  {
    key: 'height',
    label: 'Altura',
    icon: '📏',
    options: [
      { id: 'short',     label: 'Bajo',     prompt: 'short stature' },
      { id: 'average',   label: 'Medio',    prompt: 'average height' },
      { id: 'tall',      label: 'Alto',     prompt: 'tall' },
      { id: 'very-tall', label: 'Muy alto', prompt: 'very tall imposing' },
    ],
  },

  // ── Body Characteristics ──
  {
    key: 'bustSize',
    label: 'Tamaño de Busto',
    icon: '🫃',
    options: [
      { id: 'none',      label: 'Sin especificar', prompt: '' },
      { id: 'flat',      label: 'Plano',           prompt: 'flat chest' },
      { id: 'small',     label: 'Pequeño',         prompt: 'small bust' },
      { id: 'medium',    label: 'Medio',           prompt: 'medium bust' },
      { id: 'large',     label: 'Grande',          prompt: 'large bust' },
      { id: 'very_large',label: 'Muy grande',      prompt: 'very large bust' },
    ],
  },
  {
    key: 'genitalType',
    label: 'Tipo de Genitales',
    icon: '⚤',
    options: [
      { id: 'none',      label: 'Sin especificar', prompt: '' },
      { id: 'androgynous', label: 'Andrógino',     prompt: 'androgynous genitalia' },
      { id: 'male',      label: 'Masculino',       prompt: 'a penis' },
      { id: 'female',    label: 'Femenino',        prompt: 'a vagina' },
      { id: 'intersex',  label: 'Intersexo',       prompt: 'intersex genitalia' },
    ],
  },
  {
    key: 'genitalSize',
    label: 'Tamaño de Genitales',
    icon: '📐',
    options: [
      { id: 'none',   label: 'Sin especificar', prompt: '' },
      { id: 'small',  label: 'Pequeño',         prompt: 'small genitals' },
      { id: 'medium', label: 'Medio',           prompt: 'medium genitals' },
      { id: 'large',  label: 'Grande',          prompt: 'large genitals' },
    ],
  },

  // ── Clothing ──
  {
    key: 'clothing',
    label: 'Vestimenta',
    icon: '👗',
    options: [
      { id: 'none',     label: 'Sin especificar', prompt: '' },
      { id: 'nude',     label: 'Desnudo',          prompt: 'nude' },
      { id: 'armor',    label: 'Armadura',        prompt: 'wearing fantasy plate armor' },
      { id: 'leather_armor', label: 'Arm. cuero', prompt: 'wearing leather armor' },
      { id: 'robe',     label: 'Túnica',          prompt: 'wearing flowing robes' },
      { id: 'cloak',    label: 'Capa',            prompt: 'wearing a hooded cloak' },
      { id: 'royal',    label: 'Ropa real',       prompt: 'wearing royal regal clothing' },
      { id: 'elegant',  label: 'Elegante',        prompt: 'wearing elegant formal attire' },
      { id: 'casual',   label: 'Casual',          prompt: 'wearing casual clothes' },
      { id: 'peasant',  label: 'Campesino',       prompt: 'wearing simple peasant clothes' },
      { id: 'barbarian',label: 'Bárbaro',         prompt: 'wearing barbarian furs and hides' },
      { id: 'mage',     label: 'Mago',            prompt: 'wearing mage robes with arcane symbols' },
      { id: 'ranger',   label: 'Explorador',      prompt: 'wearing ranger traveling clothes' },
      { id: 'paladin',  label: 'Paladín',         prompt: 'wearing paladin armor with holy symbols' },
      { id: 'assassin', label: 'Asesino',         prompt: 'wearing dark assassin gear' },
      { id: 'pirate',   label: 'Pirata',          prompt: 'wearing pirate clothing' },
      { id: 'ninja',    label: 'Ninja',           prompt: 'wearing ninja stealth attire' },
      { id: 'samurai',  label: 'Samurái',         prompt: 'wearing samurai armor' },
      { id: 'knight',   label: 'Caballero',       prompt: 'wearing knight armor with shield' },
      { id: 'noble',    label: 'Noble',           prompt: 'wearing noble aristocratic clothing' },
      { id: 'bard',     label: 'Bardo',           prompt: 'wearing colorful bard clothing' },
      { id: 'druid',    label: 'Druida',          prompt: 'wearing natural druidic attire' },
      { id: 'monk',     label: 'Monje',           prompt: 'wearing simple monk robes' },
      { id: 'formal',   label: 'Traje formal',    prompt: 'wearing a formal suit' },
      { id: 'modern',   label: 'Moderno',         prompt: 'wearing modern streetwear' },
      { id: 'swimwear', label: 'Bañador',         prompt: 'wearing swimwear' },
      { id: 'sci_fi',   label: 'Sci-Fi',          prompt: 'wearing futuristic sci-fi armor' },
    ],
  },

  // ── Pose ──
  {
    key: 'pose',
    label: 'Pose',
    icon: '🧘',
    options: [
      { id: 'portrait',      label: 'Retrato',        prompt: 'portrait facing viewer' },
      { id: 'half_body',     label: 'Medio cuerpo',   prompt: 'half body shot' },
      { id: 'full_body',     label: 'Cuerpo entero',  prompt: 'full body standing' },
      { id: 'profile',       label: 'Perfil',         prompt: 'facing sideways profile view' },
      { id: 'three_quarter', label: 'Tres cuartos',   prompt: 'three-quarter view' },
      { id: 'action',        label: 'Acción',         prompt: 'dynamic action pose' },
      { id: 'sitting',       label: 'Sentado',        prompt: 'sitting on a throne' },
      { id: 'kneeling',      label: 'Arrodillado',    prompt: 'kneeling' },
      { id: 'fighting',      label: 'Peleando',       prompt: 'combat fighting pose with weapon' },
      { id: 'casting',       label: 'Lanz. hechizo',  prompt: 'casting a spell with magical energy' },
      { id: 'meditating',    label: 'Meditando',      prompt: 'meditating cross-legged' },
      { id: 'lying',         label: 'Tumbado',        prompt: 'lying down relaxed' },
      { id: 'leaning',       label: 'Apoyado',        prompt: 'leaning against a wall' },
      { id: 'looking_up',    label: 'Mirando arriba', prompt: 'looking upward' },
      { id: 'looking_back',  label: 'Mirando atrás',  prompt: 'looking back over shoulder' },
      { id: 'arms_crossed',  label: 'Brazos cruzados', prompt: 'with arms crossed' },
      { id: 'hand_on_hip',   label: 'Mano en cadera', prompt: 'with hand on hip confident' },
      { id: 'crouching',     label: 'Agachado',       prompt: 'crouching low' },
      { id: 'jumping',       label: 'Saltando',       prompt: 'mid-jump action' },
      { id: 'running',       label: 'Corriendo',      prompt: 'running dynamic motion' },
      { id: 'pointing',      label: 'Señalando',      prompt: 'pointing forward' },
      { id: 'holding_weapon',label: 'Con arma',       prompt: 'holding a weapon ready' },
      { id: 'dancing',       label: 'Bailando',       prompt: 'dancing elegantly' },
      { id: 'bowing',        label: 'Reverencia',     prompt: 'bowing respectfully' },
    ],
  },

  // ── Camera ──
  {
    key: 'cameraAngle',
    label: 'Posición de Cámara',
    icon: '📷',
    options: [
      { id: 'none',          label: 'Sin especificar', prompt: '' },
      { id: 'front',         label: 'Frontal',         prompt: 'facing camera directly' },
      { id: 'profile',       label: 'Perfil',          prompt: 'side profile view' },
      { id: 'three_quarter', label: 'Tres cuartos',    prompt: 'three-quarter angle view' },
      { id: 'low_angle',     label: 'Contrapicado',    prompt: 'low angle shot looking up' },
      { id: 'high_angle',    label: 'Picado',          prompt: 'high angle shot looking down' },
      { id: 'overhead',      label: 'Cenital',         prompt: 'overhead top-down view' },
      { id: 'close_up',      label: 'Primer plano',    prompt: 'close-up shot framing the face' },
      { id: 'extreme_close', label: 'Primerísimo',     prompt: 'extreme close-up shot' },
      { id: 'dutch_angle',   label: 'Cámara inclinada', prompt: 'dutch angle tilted shot' },
      { id: 'behind',        label: 'Desde atrás',     prompt: 'view from behind' },
      { id: 'worm_eye',      label: 'Supino',          prompt: 'worm\'s eye view extreme low angle' },
      { id: 'over_shoulder', label: 'Sobre hombro',    prompt: 'over the shoulder shot' },
      { id: 'wide',          label: 'Plano general',   prompt: 'wide establishing shot' },
    ],
  },

  // ── Lighting ──
  {
    key: 'lighting',
    label: 'Iluminación',
    icon: '💡',
    options: [
      { id: 'none',     label: 'Sin especificar', prompt: '' },
      { id: 'dramatic', label: 'Dramática',      prompt: 'dramatic lighting' },
      { id: 'soft',     label: 'Suave',          prompt: 'soft diffused lighting' },
      { id: 'natural',  label: 'Luz natural',    prompt: 'natural daylight' },
      { id: 'dark',     label: 'Oscura',         prompt: 'dark moody lighting' },
      { id: 'studio',   label: 'Estudio',        prompt: 'studio softbox lighting' },
      { id: 'rim',      label: 'Contraluz',      prompt: 'rim light backlit' },
      { id: 'candle',   label: 'Vela',           prompt: 'candlelit warm lighting' },
      { id: 'magical',  label: 'Luz mágica',     prompt: 'magical glowing ethereal light' },
      { id: 'sunset',   label: 'Atardecer',      prompt: 'golden hour sunset lighting' },
      { id: 'moonlight',label: 'Luz lunar',      prompt: 'moonlight pale blue lighting' },
      { id: 'fire',     label: 'Fuego',          prompt: 'warm firelight glow' },
      { id: 'neon',     label: 'Neón',           prompt: 'neon colorful lighting' },
      { id: 'storm',    label: 'Tormenta',       prompt: 'dark stormy dramatic lighting' },
      { id: 'holy',     label: 'Luz divina',     prompt: 'divine holy radiant light' },
    ],
  },

  // ── Special Traits (multi-select) ──
  {
    key: 'specialTraits',
    label: 'Rasgos Especiales',
    icon: '⭐',
    multi: true,
    options: [
      { id: 'fangs',        label: 'Colmillos',    prompt: 'with fangs' },
      { id: 'horns',        label: 'Cuernos',      prompt: 'with horns' },
      { id: 'wings',        label: 'Alas',         prompt: 'with large wings' },
      { id: 'tail',         label: 'Cola',         prompt: 'with a tail' },
      { id: 'pointed_ears', label: 'Orejas puntiagudas', prompt: 'with pointed ears' },
      { id: 'halo',         label: 'Aureola',      prompt: 'with a halo' },
      { id: 'crown',        label: 'Corona',       prompt: 'wearing a crown' },
      { id: 'piercings',    label: 'Piercings',    prompt: 'with facial piercings' },
      { id: 'jewelry',      label: 'Joyas',        prompt: 'wearing jewelry' },
      { id: 'mask',         label: 'Máscara',      prompt: 'wearing a mask' },
      { id: 'body_tattoos', label: 'Tatuajes corporales', prompt: 'with body tattoos' },
      { id: 'battle_scars', label: 'Cic. de guerra',     prompt: 'with battle scars' },
      { id: 'glowing_runes',label: 'Runas brillantes',   prompt: 'with glowing runes' },
      { id: 'eyepatch',     label: 'Parche',      prompt: 'wearing an eyepatch' },
      { id: 'monocle',      label: 'Monóculo',    prompt: 'wearing a monocle' },
      { id: 'glasses',      label: 'Gafas',       prompt: 'wearing glasses' },
      { id: 'hood',         label: 'Capa/Capucha', prompt: 'wearing a hooded cloak' },
      { id: 'tiara',        label: 'Tiara',       prompt: 'wearing a tiara' },
      { id: 'veil',         label: 'Velo',        prompt: 'wearing a veil' },
      { id: 'tentacles',    label: 'Tentáculos',  prompt: 'with tentacles' },
      { id: 'mech_arm',     label: 'Brazo mecánico', prompt: 'with a mechanical arm' },
      { id: 'cyber_implants',label: 'Implantes cyber', prompt: 'with cybernetic implants' },
      { id: 'glowing_veins', label: 'Venas brillantes', prompt: 'with glowing veins' },
      { id: 'floating_objects', label: 'Obj. flotantes', prompt: 'with floating magical objects' },
      { id: 'elemental_effects', label: 'Efectos elementales', prompt: 'surrounded by elemental magic effects' },
    ],
  },
]

// Default selections (first option in each single-select category)
export function getDefaultSelections() {
  const defaults = {}
  for (const cat of TRAIT_CATEGORIES) {
    if (cat.multi) {
      defaults[cat.key] = []
    } else if (cat.options.length) {
      defaults[cat.key] = cat.options[0]
    }
  }
  return defaults
}

// Compose a prompt string from selection objects
export function composePrompt(selections) {
  const lines = []

  // Identity + genitals (fused for trans combos)
  const racePrompt = selections.race?.prompt || 'human'
  const genderPrompt = selections.gender?.prompt || 'person'
  const agePrompt = selections.age?.prompt || 'adult'
  const genTypePrompt = selections.genitalType?.prompt || ''
  const genSizePrompt = selections.genitalSize?.prompt || ''

  // Detect trans identity + specific anatomy = fuse into one opening statement
  const isTransWoman = genderPrompt === 'trans woman'
  const isTransMan = genderPrompt === 'trans man'
  const hasExplicitGenital = genTypePrompt.startsWith('a ')
  const fusedTrans = (isTransWoman || isTransMan) && hasExplicitGenital

  if (fusedTrans) {
    // Fuse: "trans woman with a large penis" — one coherent statement
    const sizePrefix = genSizePrompt ? `${genSizePrompt}, ` : ''
    lines.push(`Character portrait of a ${racePrompt} ${genderPrompt} with ${sizePrefix}${genTypePrompt}, ${agePrompt}`)
  } else {
    lines.push(`Character portrait of a ${racePrompt} ${genderPrompt}, ${agePrompt}`)
  }

  // Expression
  if (selections.expression?.prompt && selections.expression.prompt !== 'neutral expression') {
    lines.push(`with ${selections.expression.prompt}`)
  }

  // Face features
  const faceParts = []
  if (selections.faceShape?.prompt) faceParts.push(selections.faceShape.prompt)
  if (selections.eyeShape?.prompt || selections.eyeColor?.prompt) {
    const eyeParts = []
    if (selections.eyeShape?.prompt) eyeParts.push(selections.eyeShape.prompt)
    if (selections.eyeColor?.prompt) eyeParts.push(selections.eyeColor.prompt)
    eyeParts.push('eyes')
    faceParts.push(eyeParts.join(' '))
  }
  if (selections.nose?.prompt) faceParts.push(`${selections.nose.prompt} nose`)
  if (selections.lips?.prompt) faceParts.push(`${selections.lips.prompt} lips`)
  if (faceParts.length) lines.push(`with ${faceParts.join(', ')}`)

  // Hair
  if (selections.hairStyle?.prompt && selections.hairStyle.prompt !== 'bald') {
    const hairParts = []
    hairParts.push(selections.hairStyle.prompt)
    if (selections.hairColor?.prompt) hairParts.push(selections.hairColor.prompt)
    hairParts.push('hair')
    lines.push(`with ${hairParts.join(' ')}`)
  } else if (selections.hairStyle?.prompt === 'bald') {
    lines.push('bald')
  }

  // Skin
  if (selections.skinTone?.prompt) {
    const skinParts = [`${selections.skinTone.prompt} skin`]
    if (selections.skinFeature?.prompt && selections.skinFeature.prompt !== '') {
      skinParts.push(selections.skinFeature.prompt.replace(/^, /, ''))
    }
    lines.push(`with ${skinParts.join(' ')}`)
  }

  // Facial hair
  if (selections.facialHair?.prompt && selections.facialHair.prompt !== '') {
    lines.push(selections.facialHair.prompt)
  }

  // Adult features
  const adultFeats = (selections.adultFeatures || []).filter(Boolean)
  if (adultFeats.length) {
    lines.push(adultFeats.map(t => t.prompt).join(', '))
  }

  // Body
  const bodyParts = []
  if (selections.bodyType?.prompt) bodyParts.push(`${selections.bodyType.prompt} body`)
  if (selections.height?.prompt) bodyParts.push(selections.height.prompt)
  if (selections.bustSize?.prompt && selections.bustSize.prompt !== '') bodyParts.push(selections.bustSize.prompt)
  if (bodyParts.length) lines.push(`with ${bodyParts.join(', ')}`)

  // Genital characteristics (skip if fused into identity line above)
  // fusedTrans flag already defined above — skip if true
  if (!fusedTrans) {
    const genParts = []
    if (genTypePrompt && genTypePrompt !== '') genParts.push(genTypePrompt)
    if (genSizePrompt && genSizePrompt !== '') {
      if (genParts.length && genSizePrompt) {
        genParts[0] = `${genSizePrompt}, ${genParts[0]}`
      } else {
        genParts.push(genSizePrompt)
      }
    }
    if (genParts.length) lines.push(`with ${genParts.join(', ')}`)
  }

  // Clothing
  if (selections.clothing?.prompt && selections.clothing.prompt !== '') {
    lines.push(selections.clothing.prompt)
  }

  // Pose
  if (selections.pose?.prompt) {
    lines.push(selections.pose.prompt)
  }

  // Lighting
  if (selections.lighting?.prompt && selections.lighting.prompt !== '') {
    lines.push(`${selections.lighting.prompt}`)
  }

  // Camera angle
  if (selections.cameraAngle?.prompt && selections.cameraAngle.prompt !== '') {
    lines.push(selections.cameraAngle.prompt)
  }

  // Special traits
  const activeTraits = (selections.specialTraits || []).filter(Boolean)
  if (activeTraits.length) {
    lines.push(activeTraits.map(t => t.prompt).join(', '))
  }

  // Style suffix
  lines.push('fantasy character concept art, highly detailed, professional character portrait, beautiful rendered, epic RPG character design')

  // Clean up
  return lines
    .join(', ')
    .replace(/, ,/g, ',')
    .replace(/with ,/g, '')
    .replace(/, bald/g, ', bald')
    .replace(/^, /, '')
    .replace(/, $/, '')
    .replace(/\s+,/g, ',')
    .trim()
}
