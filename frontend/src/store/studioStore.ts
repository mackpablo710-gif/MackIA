import { create } from 'zustand'
import type { BusinessAnalysis, Brand, BrandIdentity, Campaign, PostContent, ImageData, VideoScript, StudioStep, ContentFormat, Platform, Tone, Objective } from '../types'

interface StudioState {
  step: StudioStep
  businessDescription: string
  analysis: BusinessAnalysis | null
  pendingQuestions: unknown[]
  selectedCampaign: Campaign | null
  campaigns: Campaign[]
  campaignId: string | null
  selectedFormat: ContentFormat
  selectedPlatform: Platform
  selectedTone: Tone
  selectedObjective: Objective
  postContent: PostContent | null
  imageData: ImageData | null
  generatedImageUrl: string | null
  videoScript: VideoScript | null
  contentId: string | null
  isLoading: boolean
  loadingMessage: string
  activeBrand: Brand | null
  brandIdentity: BrandIdentity | null
  brandLogoUrl: string | null

  setStep: (step: StudioStep) => void
  setBusinessDescription: (desc: string) => void
  setAnalysis: (analysis: BusinessAnalysis) => void
  setPendingQuestions: (q: unknown[]) => void
  setCampaigns: (campaigns: Campaign[]) => void
  setSelectedCampaign: (campaign: Campaign) => void
  setCampaignId: (id: string) => void
  setFormat: (format: ContentFormat) => void
  setPlatform: (platform: Platform) => void
  setTone: (tone: Tone) => void
  setObjective: (objective: Objective) => void
  setPostContent: (content: PostContent) => void
  setImageData: (data: ImageData) => void
  setGeneratedImageUrl: (url: string) => void
  setVideoScript: (script: VideoScript) => void
  setContentId: (id: string) => void
  setLoading: (loading: boolean, message?: string) => void
  setActiveBrand: (brand: Brand | null) => void
  reset: () => void
}

const initialState = {
  step: 'brief' as StudioStep,
  businessDescription: '',
  analysis: null,
  pendingQuestions: [],
  selectedCampaign: null,
  campaigns: [],
  campaignId: null,
  selectedFormat: 'post' as ContentFormat,
  selectedPlatform: 'instagram' as Platform,
  selectedTone: 'profesional' as Tone,
  selectedObjective: 'ventas' as Objective,
  postContent: null,
  imageData: null,
  generatedImageUrl: null,
  videoScript: null,
  contentId: null,
  isLoading: false,
  loadingMessage: '',
  activeBrand: null,
  brandIdentity: null,
  brandLogoUrl: null,
}

export const useStudioStore = create<StudioState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setBusinessDescription: (desc) => set({ businessDescription: desc }),
  setAnalysis: (analysis) => set({ analysis }),
  setPendingQuestions: (q) => set({ pendingQuestions: q }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
  setCampaignId: (id) => set({ campaignId: id }),
  setFormat: (format) => set({ selectedFormat: format }),
  setPlatform: (platform) => set({ selectedPlatform: platform }),
  setTone: (tone) => set({ selectedTone: tone }),
  setObjective: (objective) => set({ selectedObjective: objective }),
  setPostContent: (content) => set({ postContent: content }),
  setImageData: (data) => set({ imageData: data }),
  setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
  setVideoScript: (script) => set({ videoScript: script }),
  setContentId: (id) => set({ contentId: id }),
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
  setActiveBrand: (brand) => set({
    activeBrand: brand,
    brandIdentity: brand?.brand_identity ?? null,
    brandLogoUrl: brand?.avatar_url ?? null,
    businessDescription: brand?.description ?? '',
  }),
  reset: () => set(initialState),
}))
