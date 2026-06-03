import { CATEGORY_COLOR_MAP } from '@/lib/constants'

export interface SkillXP {
  categoryId: string
  name: string
  colorToken: string
  xp: number
}

interface SkillDistributionProps {
  skills: SkillXP[]
}

export default function SkillDistribution({ skills }: SkillDistributionProps) {
  // Find max XP to scale the bars
  const maxXP = Math.max(...skills.map(s => s.xp), 100) // Minimum scale 100

  // Sort by highest XP
  const sortedSkills = [...skills].sort((a, b) => b.xp - a.xp)

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
        <h3 className="font-body-md font-bold text-on-surface flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-primary">psychology</span>
          Skill Distribution
        </h3>
      </div>

      <div className="space-y-4">
        {sortedSkills.length === 0 ? (
          <div className="text-sm font-label-mono text-on-surface-variant text-center py-4">
            No skills leveled up yet. Complete tasks to gain XP!
          </div>
        ) : (
          sortedSkills.map(skill => {
            const widthPct = Math.min((skill.xp / maxXP) * 100, 100)
            const color = CATEGORY_COLOR_MAP[skill.colorToken] || '#99907c'

            return (
              <div key={skill.categoryId} className="flex flex-col gap-1">
                <div className="flex justify-between items-end font-label-mono text-xs">
                  <span className="text-on-surface uppercase tracking-wider">{skill.name}</span>
                  <span className="text-on-surface-variant">{skill.xp} XP</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${widthPct}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}80`
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
