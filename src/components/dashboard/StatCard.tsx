import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card stat-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        right: '-20px', 
        width: '100px', 
        height: '100px', 
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '16px', 
            background: `linear-gradient(135deg, ${color}15, ${color}05)`, 
            color: color,
            border: `1px solid ${color}20`
          }}>
            <Icon size={26} strokeWidth={2.5} />
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, margin: '16px 0 8px 0' }}>{label}</p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
