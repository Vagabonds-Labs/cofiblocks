import { motion } from 'framer-motion';
import Button from './button';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  buttons: Array<{ label: string; onClick: () => void }>;
};

function Modal({ isOpen, onClose, buttons }: ModalProps) {
  if (!isOpen) return null;

  const modalVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    exit: { y: '100%', opacity: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
      <motion.div
        className="bg-white rounded-t-lg p-6 shadow-xl w-full max-w-md"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Hello!</h2>
          <p className="mb-6">Press ESC key or click the button below to close</p>

          <div className="space-y-4">
            {buttons.map((button, index) => (
              <Button
                key={`modal-button-${button.label}-${index}`}
                className="w-full"
                onClick={button.onClick}
                variant="primary"
                size="md"
              >
                {button.label}
              </Button>
            ))}
          </div>

          <Button
            className="mt-6"
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default Modal;
