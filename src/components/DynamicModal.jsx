import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

const DynamicModal = ({ show, handleClose, title, content,modalWidth }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
        <div className='assign-modal-wrapper'>
    <motion.div
        className="assign-modal logout-modal"
        style={{width:modalWidth}}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ duration: 0.25 }}
    >
      <motion.div className="modal-content">
        <div className="modal-header">
          <h5>{title}</h5>
          <button className="close-btn" onClick={handleClose}>
            <Icon icon="material-symbols:close" width="24" height="24" />
          </button>
        </div>
        <div className="modal-body">{content}</div>
      </motion.div>
    </motion.div>
    </div>
    </AnimatePresence>
  );
};

export default DynamicModal;
