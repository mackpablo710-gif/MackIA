import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Upload, Building2, ArrowRight, Loader2, X, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { Brand } from '../types'

export function Brands() {
  const navigate = useNavigate()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', website: '' })

  useEffect(() => {
    fetchBrands()
  }, [])

  async function fetchBrands() {
    try {
      const { data } = await api.get('/brands')
      setBrands(data.brands ?? [])
    } catch {
      toast.error('No se pudieron cargar las marcas')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return }
    setCreating(true)
    try {
      const { data } = await api.post('/brands', form)
      setBrands(prev => [data.brand, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '', website: '' })
      toast.success('Marca creada')
      navigate(`/brands/${data.brand.id}`)
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Mis Marcas</h1>
            <p className="text-sm text-text-muted mt-1">Cada marca tiene su identidad visual y campañas propias</p>
          </div>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Nueva marca
          </Button>
        </div>

        {brands.length === 0 && !showCreate && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-main mb-2">Crea tu primera marca</h2>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Sube el logo de tu marca y la IA extraerá su identidad visual para generar campañas coherentes.
            </p>
            <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />} size="lg">
              Crear marca
            </Button>
          </motion.div>
        )}

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-main">Nueva marca</h3>
                  <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-main">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-text-muted font-medium block mb-1">Nombre de la marca *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ej: Nike, Mi Cafetería, CVJob..."
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-text-muted font-medium block mb-1">Descripción del negocio</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="¿Qué hace esta marca? ¿A quién va dirigida?"
                      rows={3}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text-main placeholder-text-muted resize-none focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted font-medium block mb-1">Sitio web (opcional)</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        value={form.website}
                        onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCreate} loading={creating} className="w-full" icon={<Building2 size={15} />}>
                      Crear marca
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand, i) => (
            <motion.div key={brand.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <BrandCard brand={brand} onClick={() => navigate(`/brands/${brand.id}`)} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BrandCard({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  const campaignCount = brand.campaigns?.length ?? 0
  const hasLogo = !!brand.avatar_url
  const colors = brand.brand_identity?.primary_colors ?? []

  return (
    <button onClick={onClick}
      className="w-full text-left p-5 bg-surface border border-border rounded-2xl hover:border-primary/40 transition-all duration-200 group">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-bg border border-border flex-shrink-0 flex items-center justify-center">
          {hasLogo ? (
            <img src={brand.avatar_url} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={20} className="text-text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-main text-sm truncate group-hover:text-primary transition-colors">
            {brand.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{campaignCount} campaña{campaignCount !== 1 ? 's' : ''}</p>
        </div>
        <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {brand.description && (
        <p className="text-xs text-text-muted line-clamp-2 mb-3">{brand.description}</p>
      )}

      <div className="flex items-center justify-between">
        {colors.length > 0 ? (
          <div className="flex gap-1.5">
            {colors.slice(0, 4).map(c => (
              <div key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-text-muted italic">Sin logo aún</span>
        )}
        {brand.brand_identity?.style && (
          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
            {brand.brand_identity.style}
          </span>
        )}
      </div>
    </button>
  )
}
