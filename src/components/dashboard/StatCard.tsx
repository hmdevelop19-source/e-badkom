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
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginTop: '12px' }}>{label}</p>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</h3>
    </motion.div>
  );
};

export default StatCard;
