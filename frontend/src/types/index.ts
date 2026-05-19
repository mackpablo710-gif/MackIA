export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: 'free' | 'starter' | 'pro' | 'agency'
  credits: number
}

export interface Business {
  id: string
  user_id: string
  name: string
  description: string
  industry?: string
  target_audience?: string
  tone?: string
  value_prop?: string
  pain_points?: string[]
  benefits?: string[]
  differentiators?: string[]
  website?: string
  created_at: string
}

export interface BusinessAnalysis {
  business_name: string
  industry: string
  value_proposition: string
  pain_points: string[]
  benefits: string[]
  differentiators: string[]
  target_audience: {
    primary: string
    demographics: string
    psychographics: string
  }
  competitors: string[]
  tone_recommendation: string
  platform_recommendation: string[]
  missing_context: string[]
  quick_insight: string
}

export interface Campaign {
  id: number
  title: string
  concept: string
  angle: string
  hook: string
  headline: string
  subheadline: string
  body_preview: string
  why_it_works: string
  viral_potential: string
  best_format: string
  emotion: string
  weakness: string
}

export interface PostContent {
  headline: string
  subheadline: string
  body_copy: string
  cta: string
  full_caption: string
  hashtags: string[]
  character_count: number
  platform_tips: string
  best_time: string
  conversion_score: number
  director_feedback: string
  ab_alternatives: { headline_b: string; cta_b: string }
}

export interface CarouselSlide {
  number: number
  type: 'portada' | 'contenido' | 'cta'
  headline: string
  subtext: string
  visual_description: string
  design_notes: string
}

export interface CarouselContent {
  slides: CarouselSlide[]
  full_caption: string
  hashtags: string[]
  hook_analysis: string
  director_feedback: string
}

export interface ImageData {
  image_prompt: string
  negative_prompt: string
  style: string
  color_palette: string[]
  dimensions: string
  text_overlay: {
    main_text: string
    secondary_text: string
    cta_text: string
    font_recommendation: string
    text_placement: string
    text_color: string
  }
  art_director_notes: string
}

export interface VideoScene {
  id: number
  duration: string
  visual: string
  voiceover: string
  text_overlay: string
  music_note: string
  transition: string
}

export interface VideoScript {
  hook: string
  hook_analysis: string
  scenes: VideoScene[]
  cta_final: string
  total_duration: string
  video_prompt: string
  casting_notes: string
  music_style: string
  director_notes: string
  estimated_hook_rate: string
  storyboard_summary: string
}

export interface ContentPiece {
  id: string
  campaign_id?: string
  type: string
  platform: string
  headline?: string
  body?: string
  cta?: string
  caption?: string
  hashtags?: string[]
  image_url?: string
  video_script?: VideoScript
  quality_score?: number
  feedback?: string
  created_at: string
}

export interface CreditTransaction {
  id: string
  type: 'consume' | 'purchase' | 'bonus'
  amount: number
  action: string
  balance_after: number
  created_at: string
}

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'google_ads'
export type Tone = 'premium' | 'emocional' | 'corporativo' | 'agresivo' | 'divertido' | 'juvenil' | 'elegante' | 'cercano'
export type Objective = 'ventas' | 'trafico' | 'marca' | 'leads' | 'engagement'
export type ContentFormat = 'post' | 'carrusel' | 'story' | 'reel' | 'tiktok' | 'anuncio'

export type StudioStep = 'brief' | 'analysis' | 'questions' | 'campaigns' | 'content' | 'image' | 'video' | 'done'
