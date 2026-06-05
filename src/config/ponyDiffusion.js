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

// ── Tag matching (used by chat → configurator auto-apply) ──

// Build reverse map: normalized tag → { categoryKey, option }
let _reverseTagMap = null
function getReverseTagMap() {
  if (_reverseTagMap) return _reverseTagMap
  const map = new Map()
  for (const cat of PONY_CATEGORIES) {
    for (const opt of cat.options) {
      if (!opt.tag) continue
      // Split compound tags (e.g. "score_9, score_8_up, score_7_up")
      const tags = opt.tag.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      for (const t of tags) {
        // Store both raw and stripped (weight-free) keys for matching
        const raw = t
        const stripped = raw.replace(/^\(|\)$/g, '').replace(/:\d+(\.\d+)?$/, '').trim()
        const keys = raw === stripped ? [raw] : [raw, stripped]
        for (const key of keys) {
          if (!map.has(key)) map.set(key, [])
          map.get(key).push({ categoryKey: cat.key, option: opt, category: cat })
        }
      }
    }
  }
  _reverseTagMap = map
  return map
}

/**
 * Parse a raw Danbooru tag string (from AI output) and return config actions.
 * Strips weight syntax, matches against PONY_CATEGORIES options.
 *
 * Returns: { selections: { [categoryKey]: option }, extraTags: string[] }
 * - selections: single-select categories get their new option (chat overrides config)
 * - extraTags: tags that don't match any config option
 */
export function parseTagStringToActions(tagString, currentSelections) {
  const map = getReverseTagMap()
  const resultSelections = {}
  const usedTags = new Set() // track which reverse-map tags were used
  const extraTags = []
  const matchedOptions = new Set() // track option objects already selected

  // Split and clean tags
  const rawTags = tagString.split(',').map(t => t.trim()).filter(Boolean)

  for (const raw of rawTags) {
    // Strip weight syntax: (tag:1.2) → tag
    let tag = raw.replace(/^\(|\)$/g, '').replace(/:\d+(\.\d+)?$/, '').trim().toLowerCase()
    if (!tag) continue

    // Check if this tag exists in our reverse map
    const matches = map.get(tag)
    if (matches) {
      for (const m of matches) {
        const optId = m.option.id
        const optKey = `${m.categoryKey}::${optId}`

        // Don't process the same option twice
        if (matchedOptions.has(optKey)) continue

        if (m.category.multi) {
          // Multi-select: add as potential selection
          if (!resultSelections[m.categoryKey]) resultSelections[m.categoryKey] = []
          if (!resultSelections[m.categoryKey].some(s => s.id === m.option.id)) {
            resultSelections[m.categoryKey].push(m.option)
          }
        } else {
          // Single-select: first match wins (most specific tag comes first)
          if (!resultSelections[m.categoryKey]) {
            resultSelections[m.categoryKey] = m.option
          }
        }

        matchedOptions.add(optKey)
        usedTags.add(tag)

        // For compound tags like "score_9, score_8_up, score_7_up",
        // mark all component tags as used
        if (m.option.tag) {
          const compoundTags = m.option.tag.split(',').map(t => t.trim().toLowerCase())
          for (const ct of compoundTags) {
            usedTags.add(ct)
          }
        }
      }
    } else {
      // Not in any option — add to extra tags
      extraTags.push(raw)
    }
  }

  return { selections: resultSelections, extraTags }
}
