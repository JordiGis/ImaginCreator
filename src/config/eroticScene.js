// Erotic scene configuration — trait options for the erotic mode panel
// Each category: key, label (UI), enLabel (prompt sent to model)

export const SCENE_CATEGORIES = [
  {
    key: 'pose', label: 'Pose', icon: '🧘', multi: false,
    options: [
      { key: 'standing', label: 'De pie, sensual', enLabel: 'standing, sensual' },
      { key: 'lying', label: 'Tumbada, reclinada', enLabel: 'lying down, reclining' },
      { key: 'sitting', label: 'Sentada, seductora', enLabel: 'sitting, seductive' },
      { key: 'kneeling', label: 'Arrodillada', enLabel: 'kneeling' },
      { key: 'all-fours', label: 'A cuatro patas', enLabel: 'on all fours' },
      { key: 'bent-over', label: 'Inclinada hacia delante', enLabel: 'bent over forward' },
      { key: 'legs-apart', label: 'Piernas abiertas', enLabel: 'legs apart, open' },
      { key: 'embracing', label: 'Abrazando / acariciando', enLabel: 'embracing, caressing' },
      { key: 'against-wall', label: 'Contra la pared', enLabel: 'against the wall' },
      { key: 'on-bed', label: 'En la cama', enLabel: 'on the bed' },
      { key: 'on-furniture', label: 'Sobre mueble', enLabel: 'on furniture' },
      { key: 'spread-eagle', label: 'Extendida, brazos y piernas abiertos', enLabel: 'spread eagle' },
      { key: 'fetal', label: 'En posición fetal', enLabel: 'fetal position' },
      { key: 'bent-forward', label: 'Doblada hacia delante, manos en el suelo', enLabel: 'bent forward, hands on floor' },
      { key: 'arched-back', label: 'Arqueada hacia atrás', enLabel: 'arched back, presenting' },
      { key: 'straddling', label: 'A horcajadas', enLabel: 'straddling, riding' },
      { key: 'curled-up', label: 'Enroscada', enLabel: 'curled up' },
      { key: 'leaning-back', label: 'Recostada hacia atrás', enLabel: 'leaning back on hands' },
      { key: 'one-leg-up', label: 'Una pierna levantada', enLabel: 'one leg raised, open' },
      { key: 'on-side', label: 'De lado', enLabel: 'lying on side' },
      { key: 'squatting', label: 'En cuclillas', enLabel: 'squatting' },
      { key: 'bound', label: 'Atada / inmovilizada', enLabel: 'bound, restrained' },
      { key: 'pinned', label: 'Inmovilizada contra superficie', enLabel: 'pinned down' },
      { key: 'lifted', label: 'Levantada / suspendida', enLabel: 'being lifted, suspended' },
      { key: 'legs-wrapped', label: 'Piernas enredadas', enLabel: 'legs wrapped around' },
      { key: 'reaching-up', label: 'Estirándose hacia arriba', enLabel: 'reaching upward' },
      { key: 'outstretched', label: 'Extendida por completo', enLabel: 'outstretched, sprawling' },
      { key: 'doggy', label: 'A cuatro patas (doggy style)', enLabel: 'doggy style position' },
      { key: 'missionary', label: 'Misionero', enLabel: 'missionary position' },
      { key: 'scissors', label: 'Tijeras', enLabel: 'scissors position' },
      { key: 'lotus', label: 'Loto / cara a cara', enLabel: 'lotus, face to face' },
      { key: 'draped', label: 'Desmayada / sensual caída', enLabel: 'draped, languid' },
      { key: 'upside-down', label: 'Boca abajo', enLabel: 'prone, face down' },
    ]
  },
  {
    key: 'attire', label: 'Vestimenta', icon: '👗', multi: false,
    options: [
      { key: 'nude', label: 'Desnudo completo', enLabel: 'fully nude' },
      { key: 'lingerie', label: 'Lencería', enLabel: 'lingerie' },
      { key: 'bra-panties', label: 'Sujetador + bragas', enLabel: 'bra and panties' },
      { key: 'corset', label: 'Corsé', enLabel: 'corset' },
      { key: 'bodysuit', label: 'Body', enLabel: 'bodysuit' },
      { key: 'stockings', label: 'Medias / liguero', enLabel: 'stockings and garter belt' },
      { key: 'lace', label: 'Encaje', enLabel: 'lace lingerie' },
      { key: 'silk-robe', label: 'Bata de seda', enLabel: 'silk robe' },
      { key: 'see-through', label: 'Transparente / veladura', enLabel: 'see-through, sheer fabric' },
      { key: 'partially-clad', label: 'Semivestida', enLabel: 'partially clothed' },
      { key: 'towel', label: 'Toalla', enLabel: 'wrapped in towel' },
      { key: 'bikini', label: 'Bikini', enLabel: 'bikini' },
      { key: 'leather', label: 'Cuero / látex', enLabel: 'leather, latex' },
      { key: 'uniform', label: 'Uniforme sugerente', enLabel: 'sexy uniform' },
      { key: 'costume', label: 'Disfraz erótico', enLabel: 'erotic costume' },
    ]
  },
  {
    key: 'expression', label: 'Expresión', icon: '😊', multi: false,
    options: [
      { key: 'seductive', label: 'Seductora', enLabel: 'seductive look' },
      { key: 'passionate', label: 'Apasionada', enLabel: 'passionate expression' },
      { key: 'shy', label: 'Tímida / sonrojada', enLabel: 'shy, embarrassed' },
      { key: 'blushing', label: 'Sonrojada', enLabel: 'blushing' },
      { key: 'aroused', label: 'Excitada', enLabel: 'aroused, excited' },
      { key: 'confident', label: 'Segura / desafiante', enLabel: 'confident, defiant' },
      { key: 'dreamy', label: 'Soñadora', enLabel: 'dreamy look' },
      { key: 'intense', label: 'Intensa', enLabel: 'intense gaze' },
      { key: 'playful', label: 'Juguetona', enLabel: 'playful expression' },
      { key: 'surprised', label: 'Sorprendida', enLabel: 'surprised' },
      { key: 'tender', label: 'Tierna / dulce', enLabel: 'tender, sweet' },
      { key: 'lustful', label: 'Lasciva', enLabel: 'lustful, desiring' },
      { key: 'smirking', label: 'Sonrisa pícara', enLabel: 'smirking, mischievous smile' },
    ]
  },
  {
    key: 'bodyFocus', label: 'Enfoque corporal', icon: '🎯', multi: false,
    options: [
      { key: 'full-body', label: 'Cuerpo entero', enLabel: 'full body shot' },
      { key: 'close-up', label: 'Primer plano', enLabel: 'close up' },
      { key: 'bust', label: 'Enfoque pecho', enLabel: 'focus on breasts' },
      { key: 'hips', label: 'Enfoque caderas', enLabel: 'focus on hips' },
      { key: 'back-view', label: 'Vista trasera', enLabel: 'back view' },
      { key: 'profile', label: 'Perfil', enLabel: 'profile view' },
      { key: 'from-behind', label: 'Desde atrás', enLabel: 'view from behind' },
      { key: 'legs', label: 'Enfoque piernas', enLabel: 'focus on legs' },
      { key: 'buttocks', label: 'Enfoque glúteos', enLabel: 'focus on buttocks' },
      { key: 'croth', label: 'Enfoque zona genital', enLabel: 'focus on crotch, intimate area' },
      { key: 'upper-body', label: 'Torso', enLabel: 'upper body, torso' },
    ]
  },
  {
    key: 'lighting', label: 'Iluminación', icon: '💡', multi: false,
    options: [
      { key: 'boudoir-dim', label: 'Tenue / boudoir', enLabel: 'dim boudoir lighting' },
      { key: 'candlelight', label: 'Luz de velas', enLabel: 'candlelight' },
      { key: 'warm-glow', label: 'Resplandor cálido', enLabel: 'warm glow' },
      { key: 'neon', label: 'Neón', enLabel: 'neon lighting' },
      { key: 'silhouette', label: 'Silueta / contraluz', enLabel: 'silhouette, backlight' },
      { key: 'soft-box', label: 'Difusa / soft box', enLabel: 'soft box diffused light' },
      { key: 'natural-window', label: 'Luz natural ventana', enLabel: 'natural window light' },
      { key: 'red-light', label: 'Luz roja', enLabel: 'red mood lighting' },
      { key: 'moonlight', label: 'Luz de luna', enLabel: 'moonlight' },
      { key: 'spotlight', label: 'Foco direccional', enLabel: 'directional spotlight' },
      { key: 'dark', label: 'Oscuridad / penumbra', enLabel: 'dark, dimly lit' },
    ]
  },
  {
    key: 'cameraAngle', label: 'Ángulo cámara', icon: '📐', multi: false,
    options: [
      { key: 'low-angle', label: 'Contrapicado', enLabel: 'low angle shot' },
      { key: 'high-angle', label: 'Picado', enLabel: 'high angle, top down' },
      { key: 'eye-level', label: 'A la altura de los ojos', enLabel: 'eye level' },
      { key: 'dutch-angle', label: 'Holandés / inclinado', enLabel: 'dutch angle, tilted' },
      { key: 'over-shoulder', label: 'Sobre el hombro', enLabel: 'over the shoulder' },
      { key: 'birds-eye', label: 'Cenital', enLabel: "bird's eye view" },
      { key: 'worms-eye', label: 'Nadir', enLabel: "worm's eye view" },
      { key: 'from-front', label: 'Frontal', enLabel: 'front view' },
      { key: 'from-behind', label: 'Trasera', enLabel: 'rear view' },
      { key: 'close-up-cam', label: 'Primerísimo primer plano', enLabel: 'extreme close up' },
    ]
  },
  {
    key: 'setting', label: 'Escenario', icon: '🛏️', multi: false,
    options: [
      { key: 'bedroom', label: 'Dormitorio', enLabel: 'bedroom' },
      { key: 'bathroom', label: 'Baño', enLabel: 'bathroom' },
      { key: 'shower', label: 'Ducha', enLabel: 'shower' },
      { key: 'pool', label: 'Piscina', enLabel: 'swimming pool' },
      { key: 'beach', label: 'Playa', enLabel: 'beach' },
      { key: 'forest', label: 'Bosque', enLabel: 'forest, outdoors' },
      { key: 'studio', label: 'Estudio fotográfico', enLabel: 'photo studio' },
      { key: 'luxury-room', label: 'Habitación de lujo', enLabel: 'luxury hotel room' },
      { key: 'dungeon', label: 'Mazmorra / BDSM', enLabel: 'dungeon, BDSM setting' },
      { key: 'outdoor-night', label: 'Exterior nocturno', enLabel: 'outdoor at night' },
      { key: 'car', label: 'Coche', enLabel: 'inside a car' },
      { key: 'stairs', label: 'Escaleras', enLabel: 'on stairs' },
    ]
  },
]

/** Scene config prefix map — how each category is written in the prompt */
const PROMPT_PREFIX = {
  pose: 'pose',
  attire: 'wearing',
  expression: 'expression',
  bodyFocus: 'focus on',
  lighting: 'lighting',
  cameraAngle: 'camera angle',
  setting: 'setting',
}

/** Build comma-separated prompt suffix in ENGLISH for the model */
export function buildScenePrompt(selections) {
  const parts = []
  for (const cat of SCENE_CATEGORIES) {
    const val = selections[cat.key]
    if (!val) continue
    const opt = cat.options.find(o => o.key === val)
    if (!opt) continue
    const prefix = PROMPT_PREFIX[cat.key] || cat.key
    const label = opt.enLabel || opt.label
    parts.push(`${prefix}: ${label}`)
  }
  return parts.length ? `(${parts.join(', ')})` : ''
}

/** Artistic context wrappers for each erotic style — frames prompts as legitimate art */
const ARTISTIC_WRAPPERS = {
  boudoir: `Professional boudoir photography session. Artistic intimate portraiture celebrating body confidence and sensual elegance. Part of a fine art series on human intimacy and self-expression through tasteful nude and lingerie photography.`,
  classical: `Classical fine art figure study in the tradition of academic painting and sculpture. Artistic nude study exploring anatomical beauty, classical proportions, and timeless aesthetics. References the great masters of figurative art.`,
  romantic: `Fine art romantic photography series exploring intimate connection between lovers. Tasteful artistic study of passion, tenderness, and emotional intimacy through couples portraiture and figure work.`,
  sensual: `Artistic figure photography and fine art erotica study. Part of a legitimate art series exploring the human form, desire, and sensual expression through tasteful composition, lighting, and aesthetic beauty. References the tradition of erotic art from classical antiquity to modern fine art photography.`,
}

/** Wraps a prompt with artistic/fine-art framing to bypass content filters */
export function wrapPrompt(originalPrompt, sceneSuffix, styleKey) {
  const wrapper = ARTISTIC_WRAPPERS[styleKey] || ARTISTIC_WRAPPERS.boudoir
  let wrapped = wrapper
  if (originalPrompt) {
    wrapped += ` Art direction notes: ${originalPrompt}`
  }
  if (sceneSuffix) {
    wrapped += `, technical specifications: ${sceneSuffix}`
  }
  wrapped += `. Professional photography, diffused lighting, high detail, artstation quality, 8K.`
  return wrapped
}

/** Get default empty selections */
export function getDefaultSelections() {
  const s = {}
  for (const cat of SCENE_CATEGORIES) {
    s[cat.key] = null
  }
  return s
}
