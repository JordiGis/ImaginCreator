// Pony Diffusion V6 XL — Danbooru-style tag configurator
// Each option maps to tag(s) the model speaks natively.
// Pony uses comma-separated Danbooru tags with rating prefix.

export const PONY_CATEGORIES = [
  // ── Rating ──
  {
    key: 'rating',
    label: 'Rating',
    icon: '🔞',
    options: [
      { id: 'explicit', label: 'Explícito (NSFW)', tag: 'rating:explicit' },
      { id: 'questionable', label: 'Cuestionable', tag: 'rating:questionable' },
      { id: 'safe', label: 'Seguro (SFW)', tag: 'rating:safe' },
    ],
  },

  // ── Quality tokens ──
  {
    key: 'quality',
    label: 'Calidad',
    icon: '✨',
    options: [
      { id: 'score_9', label: 'Máxima', tag: 'score_9, score_8_up, score_7_up' },
      { id: 'score_8', label: 'Alta', tag: 'score_8_up, score_7_up' },
      { id: 'score_7', label: 'Normal', tag: 'score_7_up' },
    ],
  },

  // ── Subject ──
  {
    key: 'subject',
    label: 'Sujeto',
    icon: '👤',
    options: [
      { id: '1girl', label: '1 Chica', tag: '1girl' },
      { id: '1boy', label: '1 Chico', tag: '1boy' },
      { id: 'solo_female', label: 'Solo femenino', tag: 'solo, 1girl' },
      { id: 'solo_male', label: 'Solo masculino', tag: 'solo, 1boy' },
      { id: '1girl_1boy', label: 'Pareja H-M', tag: '1girl, 1boy, couple' },
      { id: '2girls', label: '2 Chicas', tag: '2girls, yuri' },
      { id: '2boys', label: '2 Chicos', tag: '2boys, bara' },
      { id: 'group', label: 'Grupo / Orgía', tag: 'group, multiple_girls' },
    ],
  },

  // ── Body focus ──
  {
    key: 'bodyFocus',
    label: 'Enfoque',
    icon: '🎯',
    options: [
      { id: 'full', label: 'Cuerpo entero', tag: 'full_body' },
      { id: 'upper', label: 'Torso / parte superior', tag: 'upper_body' },
      { id: 'lower', label: 'Parte inferior', tag: 'lower_body' },
      { id: 'breasts_focus', label: 'Pecho', tag: 'focus_on_breasts' },
      { id: 'buttocks_focus', label: 'Glúteos', tag: 'focus_on_buttocks' },
      { id: 'crotch_focus', label: 'Entrepierna', tag: 'focus_on_crotch' },
      { id: 'face_focus', label: 'Rostro', tag: 'focus_on_face' },
    ],
  },

  // ── Breasts size ──
  {
    key: 'breasts',
    label: 'Pecho',
    icon: '🍈',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'small_breasts', label: 'Pequeño', tag: 'small_breasts' },
      { id: 'medium_breasts', label: 'Mediano', tag: 'medium_breasts' },
      { id: 'large_breasts', label: 'Grande', tag: 'large_breasts' },
      { id: 'huge_breasts', label: 'Muy grande', tag: 'huge_breasts' },
    ],
  },

  // ── Genitalia visibility ──
  {
    key: 'genitalia',
    label: 'Genitales',
    icon: '⚤',
    options: [
      { id: 'none', label: 'No visibles', tag: '' },
      { id: 'penis', label: 'Pene visible', tag: 'penis' },
      { id: 'vagina', label: 'Vagina visible', tag: 'pussy, vagina' },
      { id: 'both', label: 'Ambos (futa)', tag: 'penis, vagina, hermaphrodite' },
      { id: 'erection', label: 'Erección', tag: 'erection' },
    ],
  },

  // ── Hair length/style ──
  {
    key: 'hair',
    label: 'Pelo',
    icon: '💇',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'long_hair', label: 'Largo', tag: 'long_hair' },
      { id: 'medium_hair', label: 'Media melena', tag: 'medium_hair' },
      { id: 'short_hair', label: 'Corto', tag: 'short_hair' },
      { id: 'very_long_hair', label: 'Muy largo', tag: 'very_long_hair' },
      { id: 'twin_tails', label: 'Coletas', tag: 'twin_tails' },
      { id: 'ponytail', label: 'Cola de caballo', tag: 'ponytail' },
    ],
  },

  // ── Hair color ──
  {
    key: 'hairColor',
    label: 'Color de Pelo',
    icon: '🟤',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'blonde_hair', label: 'Rubio', tag: 'blonde_hair' },
      { id: 'brown_hair', label: 'Castaño', tag: 'brown_hair' },
      { id: 'black_hair', label: 'Negro', tag: 'black_hair' },
      { id: 'red_hair', label: 'Pelirrojo', tag: 'red_hair' },
      { id: 'white_hair', label: 'Blanco/Gris', tag: 'white_hair, grey_hair' },
      { id: 'blue_hair', label: 'Azul', tag: 'blue_hair' },
      { id: 'pink_hair', label: 'Rosa', tag: 'pink_hair' },
      { id: 'purple_hair', label: 'Púrpura', tag: 'purple_hair' },
    ],
  },

  // ── Eye color ──
  {
    key: 'eyeColor',
    label: 'Color de Ojos',
    icon: '👁️',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'blue_eyes', label: 'Azules', tag: 'blue_eyes' },
      { id: 'green_eyes', label: 'Verdes', tag: 'green_eyes' },
      { id: 'red_eyes', label: 'Rojos', tag: 'red_eyes' },
      { id: 'brown_eyes', label: 'Marrones', tag: 'brown_eyes' },
      { id: 'heterochromia', label: 'Heterocromía', tag: 'heterochromia' },
    ],
  },

  // ── Expression ──
  {
    key: 'expression',
    label: 'Expresión',
    icon: '😊',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'blush', label: 'Sonrojo (blush)', tag: 'blush' },
      { id: 'smile', label: 'Sonrisa', tag: 'smile' },
      { id: 'ahegao', label: 'Ahegao', tag: 'ahegao' },
      { id: 'seductive_smile', label: 'Sonrisa seductora', tag: 'seductive_smile' },
      { id: 'open_mouth', label: 'Boca abierta', tag: 'open_mouth' },
      { id: 'tongue_out', label: 'Lengua fuera', tag: 'tongue_out' },
      { id: 'drooling', label: 'Babeando', tag: 'drooling' },
      { id: 'tears', label: 'Lágrimas', tag: 'tears' },
      { id: 'surprised', label: 'Sorprendido/a', tag: 'surprised' },
      { id: 'angry', label: 'Enfadado/a', tag: 'angry' },
    ],
  },

  // ── Attire / clothing ──
  {
    key: 'clothing',
    label: 'Vestimenta',
    icon: '👗',
    options: [
      { id: 'nude', label: 'Desnudo/a', tag: 'nude' },
      { id: 'lingerie', label: 'Lencería', tag: 'lingerie' },
      { id: 'bra_panties', label: 'Sujetador + bragas', tag: 'bra, panties' },
      { id: 'corset', label: 'Corsé', tag: 'corset' },
      { id: 'stockings', label: 'Medias / liguero', tag: 'stockings, garter_belt' },
      { id: 'thong', label: 'Tanga', tag: 'thong' },
      { id: 'naked_apron', label: 'Solo delantal', tag: 'naked_apron' },
      { id: 'bikini', label: 'Bikini', tag: 'bikini' },
      { id: 'robe', label: 'Bata / albornoz', tag: 'robe' },
      { id: 'suit', label: 'Traje formal', tag: 'suit' },
      { id: 'uniform', label: 'Uniforme', tag: 'uniform' },
      { id: 'partially_clothed', label: 'Semivestido/a', tag: 'partially_clothed' },
      { id: 'see_through', label: 'Ropa transparente', tag: 'see-through' },
    ],
  },

  // ── Pose ──
  {
    key: 'pose',
    label: 'Pose',
    icon: '🧘',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'standing', label: 'De pie', tag: 'standing' },
      { id: 'lying', label: 'Tumbado/a', tag: 'lying' },
      { id: 'sitting', label: 'Sentado/a', tag: 'sitting' },
      { id: 'spread_legs', label: 'Piernas abiertas', tag: 'spread_legs, legs_open' },
      { id: 'on_all_fours', label: 'A cuatro patas', tag: 'on_all_fours' },
      { id: 'bent_over', label: 'Inclinado/a hacia delante', tag: 'bent_over' },
      { id: 'kneeling', label: 'Arrodillado/a', tag: 'kneeling' },
      { id: 'doggy_style', label: 'Doggy style', tag: 'doggy_style, from_behind' },
      { id: 'missionary', label: 'Misionero', tag: 'missionary_position' },
      { id: 'cowgirl', label: 'Vaquera (encima)', tag: 'cowgirl_position' },
      { id: 'sixty_nine', label: '69', tag: 'sixty_nine' },
      { id: 'against_wall', label: 'Contra la pared', tag: 'against_wall' },
      { id: 'facing_viewer', label: 'Mirando al frente', tag: 'facing_viewer' },
      { id: 'from_behind', label: 'Desde atrás', tag: 'from_behind' },
      { id: 'bound', label: 'Atado/a / inmovilizado/a', tag: 'bound, bondage' },
    ],
  },

  // ── Sexual activity ──
  {
    key: 'action',
    label: 'Acción',
    icon: '🔥',
    options: [
      { id: 'none', label: 'Ninguna (quieto/a)', tag: '' },
      { id: 'masturbation', label: 'Masturbación', tag: 'masturbation' },
      { id: 'vaginal_sex', label: 'Sexo vaginal', tag: 'vaginal' },
      { id: 'anal_sex', label: 'Sexo anal', tag: 'anal' },
      { id: 'fellatio', label: 'Fellatio / mamada', tag: 'fellatio, blowjob' },
      { id: 'cunnilingus', label: 'Cunnilingus', tag: 'cunnilingus' },
      { id: 'handjob', label: 'Masturbación manual', tag: 'handjob' },
      { id: 'footjob', label: 'Footjob', tag: 'footjob' },
      { id: 'facial', label: 'Corrida facial', tag: 'facial, cum_on_face' },
      { id: 'cum_in_mouth', label: 'Leche en boca', tag: 'cum_in_mouth' },
      { id: 'cum_inside', label: 'Leche interna / creampie', tag: 'creampie' },
      { id: 'cum_on_body', label: 'Corrida en cuerpo', tag: 'cum_on_body' },
      { id: 'piledriver', label: 'Piledriver', tag: 'piledriver' },
      { id: 'double_penetration', label: 'Doble penetración', tag: 'double_penetration' },
      { id: 'group_sex', label: 'Sexo en grupo', tag: 'gangbang' },
    ],
  },

  // ── Environment ──
  {
    key: 'environment',
    label: 'Entorno',
    icon: '🛏️',
    options: [
      { id: 'none', label: 'Sin especificar', tag: '' },
      { id: 'bedroom', label: 'Dormitorio', tag: 'bedroom' },
      { id: 'bathroom', label: 'Baño', tag: 'bathroom' },
      { id: 'shower', label: 'Ducha', tag: 'shower' },
      { id: 'outdoors', label: 'Exterior / naturaleza', tag: 'outdoors' },
      { id: 'beach', label: 'Playa', tag: 'beach, seaside' },
      { id: 'pool', label: 'Piscina', tag: 'swimming_pool' },
      { id: 'sofa', label: 'Sofá', tag: 'couch' },
      { id: 'bed', label: 'Cama', tag: 'bed' },
      { id: 'car', label: 'Coche', tag: 'car' },
      { id: 'classroom', label: 'Aula / clase', tag: 'classroom' },
    ],
  },

  // ── Extra details (multi-select) ──
  {
    key: 'details',
    label: 'Detalles extra',
    icon: '✨',
    multi: true,
    options: [
      { id: 'nipples', label: 'Pezones visibles', tag: 'nipples' },
      { id: 'areola', label: 'Areola visible', tag: 'areola' },
      { id: 'pubic_hair', label: 'Vello púbico', tag: 'pubic_hair' },
      { id: 'navel', label: 'Ombligo', tag: 'navel' },
      { id: 'ass', label: 'Ano visible', tag: 'ass' },
      { id: 'sweat', label: 'Sudor / mojado', tag: 'sweat' },
      { id: 'cum_on_body_d', label: 'Semen en cuerpo', tag: 'cum' },
      { id: 'muscular', label: 'Musculatura marcada', tag: 'muscular, abs' },
      { id: 'body_hair_d', label: 'Vello corporal', tag: 'body_hair' },
      { id: 'thick_thighs', label: 'Muslos gruesos', tag: 'thick_thighs' },
      { id: 'wide_hips', label: 'Caderas anchas', tag: 'wide_hips' },
      { id: 'piercings_d', label: 'Piercings', tag: 'piercing' },
      { id: 'tattoo_d', label: 'Tatuajes', tag: 'tattoo' },
      { id: 'mole', label: 'Lunar (beauty mark)', tag: 'beauty_mark' },
      { id: 'jewelry_d', label: 'Joyas', tag: 'jewelry' },
      { id: 'thighhighs', label: 'Medias altas', tag: 'thighhighs' },
      { id: 'gloves_d', label: 'Guantes', tag: 'gloves' },
      { id: 'bdsm_d', label: 'BDSM / bondage', tag: 'bondage, bdsm' },
      { id: 'choking', label: 'Ahorcamiento erotic', tag: 'choking' },
    ],
  },

  // ── Emphasis / quality prompt suffix ──
  {
    key: 'emphasis',
    label: 'Énfasis final',
    icon: '⚡',
    options: [
      { id: 'masterpiece', label: 'Masterpiece quality', tag: '(masterpiece:1.2), (best_quality:1.2)' },
      { id: 'photorealistic', label: 'Fotorrealista', tag: '(photorealistic:1.3), (realistic:1.2)' },
      { id: 'anime', label: 'Estilo anime', tag: '(anime_style:1.2)' },
      { id: 'detailed', label: 'Muy detallado', tag: '(detailed:1.1), (high_detailed:1.1)' },
      { id: 'cinematic', label: 'Cinematográfico', tag: '(cinematic:1.2), (epic:1.1)' },
      { id: 'none', label: 'Sin énfasis extra', tag: '' },
    ],
  },
]

/** Get default selections — sensible NSFW start */
export function getDefaultSelections() {
  const defaults = {}
  for (const cat of PONY_CATEGORIES) {
    if (cat.multi) {
      defaults[cat.key] = []
    } else if (cat.options.length) {
      defaults[cat.key] = cat.options[0]
    }
  }
  return defaults
}

/** Compose selections into a Pony Diffusion tag string */
export function composeTags(selections) {
  const parts = []

  // rating first — always
  if (selections.rating?.tag) parts.push(selections.rating.tag)

  // quality
  if (selections.quality?.tag) parts.push(selections.quality.tag)

  // subject
  if (selections.subject?.tag) parts.push(selections.subject.tag)

  // hair
  if (selections.hair?.tag && selections.hair.id !== 'none') {
    parts.push(selections.hair.tag)
  }
  if (selections.hairColor?.tag && selections.hairColor.id !== 'none') {
    parts.push(selections.hairColor.tag)
  }

  // eyes
  if (selections.eyeColor?.tag && selections.eyeColor.id !== 'none') {
    parts.push(selections.eyeColor.tag)
  }

  // expression
  if (selections.expression?.tag && selections.expression.id !== 'none') {
    parts.push(selections.expression.tag)
  }

  // body focus (skip if full body — default, no need to tag)
  if (selections.bodyFocus?.tag && selections.bodyFocus.id !== 'full') {
    parts.push(selections.bodyFocus.tag)
  }

  // breasts
  if (selections.breasts?.tag && selections.breasts.id !== 'none') {
    parts.push(selections.breasts.tag)
  }

  // genitalia
  if (selections.genitalia?.tag && selections.genitalia.id !== 'none') {
    parts.push(selections.genitalia.tag)
  }

  // clothing
  if (selections.clothing?.tag && selections.clothing.id !== 'none') {
    parts.push(selections.clothing.tag)
  }

  // pose
  if (selections.pose?.tag && selections.pose.id !== 'none') {
    parts.push(selections.pose.tag)
  }

  // action
  if (selections.action?.tag && selections.action.id !== 'none') {
    parts.push(selections.action.tag)
  }

  // environment
  if (selections.environment?.tag && selections.environment.id !== 'none') {
    parts.push(selections.environment.tag)
  }

  // multi-select details
  const details = (selections.details || []).filter(Boolean)
  for (const d of details) {
    if (d.tag) parts.push(d.tag)
  }

  // emphasis at very end
  if (selections.emphasis?.tag && selections.emphasis.id !== 'none') {
    parts.push(selections.emphasis.tag)
  }

  return parts.join(', ')
}

/**
 * Recommend Draw Things parameter ranges based on tag selections.
 * Returns array of parameter cards with label, range, recommended value, and rationale.
 */
export function getDrawThingsSettings(selections) {
  const ctx = {
    hasAction: selections.action?.id !== 'none',
    style: selections.emphasis?.id || 'masterpiece',
    isGroup: selections.subject?.id === 'group',
    isCouple: selections.subject?.id?.includes('1girl_1boy') || selections.subject?.id?.includes('2girls') || selections.subject?.id?.includes('2boys'),
    hasBodyFocus: selections.bodyFocus?.id !== 'full' && selections.bodyFocus?.id !== 'none',
    expression: selections.expression?.id,
  }

  // ── CFG Scale ──
  let cfgMin = 6, cfgMax = 9, cfgRec = 7, cfgNote = 'Estándar Pony Diffusion'
  if (ctx.style === 'photorealistic') {
    cfgMin = 4; cfgMax = 7; cfgRec = 5.5; cfgNote = 'Fotorrealismo necesita CFG bajo para evitar saturación'
  } else if (ctx.style === 'anime') {
    cfgMin = 8; cfgMax = 11; cfgRec = 9; cfgNote = 'Estilo anime se beneficia de CFG alto para contornos marcados'
  } else if (ctx.style === 'cinematic') {
    cfgMin = 6; cfgMax = 9; cfgRec = 7.5; cfgNote = 'Cinematográfico: equilibrar detalle con naturalidad'
  }
  if (ctx.hasAction) {
    cfgRec = Math.min(cfgRec + 0.5, 12); cfgNote += ' — acción requiere +0.5 CFG'
  }
  if (ctx.isGroup) {
    cfgMax = Math.min(cfgMax + 1, 13); cfgRec = Math.min(cfgRec + 1, 12); cfgNote += ' — grupo necesita +1 CFG'
  }

  // ── Steps ──
  let stepsMin = 28, stepsMax = 40, stepsRec = 32, stepsNote = 'Estándar Pony'
  if (ctx.style === 'photorealistic') {
    stepsMin = 20; stepsMax = 30; stepsRec = 25; stepsNote = 'Fotorrealismo: menos steps preserva naturalidad'
  } else if (ctx.style === 'anime') {
    stepsMin = 30; stepsMax = 50; stepsRec = 38; stepsNote = 'Anime: más steps para refinamiento'
  } else if (ctx.style === 'cinematic') {
    stepsMin = 30; stepsMax = 45; stepsRec = 36; stepsNote = 'Cinematográfico: balance detalle-velocidad'
  }
  if (ctx.hasAction) {
    stepsRec = Math.min(stepsRec + 4, 55); stepsNote += ' — acción compleja, +4 steps'
  }

  // ── Sampler ──
  let sampler = 'DPM++ 2M Karras', samplerNote = 'Mejor balance calidad/velocidad para Pony'
  if (ctx.style === 'photorealistic') {
    sampler = 'Euler a'; samplerNote = 'Euler a da texturas más naturales para realismo'
  } else if (ctx.style === 'anime') {
    sampler = 'DPM++ 2M SDE Karras'; samplerNote = 'SDE Karras refina bordes para estilo anime'
  } else if (ctx.style === 'cinematic') {
    sampler = 'DPM++ 3M SDE'; samplerNote = '3M SDE para gradientes suaves cinematográficos'
  }

  // ── Clip Skip ──
  let clipSkip = 2, clipSkipNote = 'Pony V6 recomienda Clip Skip 2 por defecto'
  if (ctx.style === 'photorealistic') {
    clipSkip = 1; clipSkipNote = 'Clip Skip 1 para preservar fidelidad realista'
  }

  // ── Resolution ──
  const resolutions = [
    { w: 1024, h: 1024, label: '1:1 (1024²)', note: 'SDXL nativa — recomendada' },
    { w: 1152, h: 896, label: '4:3 horizontal (1152×896)', note: 'Bueno para cuerpos enteros' },
    { w: 896, h: 1152, label: '3:4 vertical (896×1152)', note: 'Bueno para retratos' },
    { w: 1216, h: 832, label: '3:2 horizontal (1216×832)', note: 'Paisajes / escenas amplias' },
    { w: 832, h: 1216, label: '2:3 vertical (832×1216)', note: 'Cuerpo entero vertical' },
  ]
  let resRec = 0, resNote = 'Usar resolución nativa SDXL (múltiplos de 64)'
  if (ctx.style === 'photorealistic') {
    resRec = 1; resNote = '4:3 ligeramente mejor para fotorrealismo'
  } else if (ctx.style === 'cinematic') {
    resRec = 3; resNote = '3:2 es relación cinematográfica clásica'
  }
  if (ctx.hasBodyFocus) {
    resRec = 0; resNote = '1:1 o vertical para planos detalle'
  }

  // ── Fuerza (Denoising Strength) ──
  // Draw Things: solo afecta si importas imagen de referencia (img2img).
  // 100% = imagen fuente ignorada = modo texto a imagen.
  let fuerzaRec = 0.4, fuerzaMin = 0.3, fuerzaMax = 0.55, fuerzaNote = 'Solo en img2img. Bajo = respeta original, alto = libertad artística. 100% = texto a imagen.'
  if (ctx.style === 'anime') {
    fuerzaRec = 0.5; fuerzaMin = 0.4; fuerzaMax = 0.6; fuerzaNote = 'Anime tolera más fuerza.'
  }
  if (ctx.style === 'photorealistic') {
    fuerzaRec = 0.35; fuerzaMin = 0.25; fuerzaMax = 0.5; fuerzaNote = 'Fuerza baja preserva estructura de imagen original.'
  }

  // ── Semilla (Seed) ──
  let seedNote = '-1 = aleatoria. Usa un número fijo para reproducir el mismo resultado.'
  if (ctx.hasAction) {
    seedNote += ' Escenas de acción: prueba seeds distintas si ves artefactos.'
  }

  // ── Prompt negativo ──
  let negBase = 'bad anatomy, ugly, distorted, low quality, worst quality'
  let negExtra = ''
  if (ctx.style === 'photorealistic') {
    negExtra = ', illustration, cartoon, 3d render, painting'
  } else if (ctx.style === 'anime') {
    negExtra = ', realistic, photograph, 3d render, photorealistic'
  }
  let negNote = 'Copia esto en el campo "Prompt negativo" de Draw Things.'

  return [
    {
      param: 'Escala CFG',
      icon: '🎛️',
      min: cfgMin,
      max: cfgMax,
      recommended: cfgRec,
      note: cfgNote,
    },
    {
      param: 'Pasos',
      icon: '👣',
      min: stepsMin,
      max: stepsMax,
      recommended: stepsRec,
      note: stepsNote,
    },
    {
      param: 'Muestreador',
      icon: '🧪',
      value: sampler,
      note: samplerNote,
    },
    {
      param: 'Clip Skip',
      icon: '✂️',
      value: clipSkip,
      note: clipSkipNote,
    },
    {
      param: 'Semilla',
      icon: '🎲',
      value: 'Aleatoria (-1)',
      note: seedNote,
    },
    {
      param: 'Tamaño',
      icon: '📐',
      options: resolutions,
      recommendedIdx: resRec,
      note: resNote,
    },
    {
      param: 'Prompt negativo',
      icon: '🚫',
      value: `${negBase}${negExtra}`,
      note: negNote,
    },
    {
      param: 'Fuerza',
      icon: '🌊',
      min: fuerzaMin,
      max: fuerzaMax,
      recommended: fuerzaRec,
      note: fuerzaNote,
    },
  ]
}
