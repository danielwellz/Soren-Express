import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUBMIT_SUPPORT_MESSAGE_MUTATION } from '../../graphql/documents';
import { useMutationAction } from '../../hooks/useMutationAction';
import { useLocale } from '../../context/LocaleContext';

export function HelpCenterWidget() {
  const { t } = useTranslation();
  const runMutation = useMutationAction();
  const { direction } = useLocale();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const [submitSupportMessage, { loading }] = useMutation(SUBMIT_SUPPORT_MESSAGE_MUTATION);

  return (
    <Box
      sx={{
        position: 'fixed',
        right: direction === 'rtl' ? 'auto' : 16,
        left: direction === 'rtl' ? 16 : 'auto',
        bottom: 16,
        zIndex: 1300,
        display: { xs: 'none', md: 'block' },
      }}
    >
      {open ? (
        <Card className="surface-glass" sx={{ width: 320 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('chat.title')}
              </Typography>
              <IconButton aria-label={t('common.close')} onClick={() => setOpen(false)} size="small">
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
              {t('chat.intro')}
            </Typography>
            <Stack spacing={1}>
              <TextField
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                label={t('newsletter.emailLabel')}
              />
              <TextField
                multiline
                minRows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t('chat.placeholder')}
              />
              <Button
                variant="contained"
                disabled={loading || !message.trim()}
                onClick={() => {
                  void runMutation(
                    () =>
                      submitSupportMessage({
                        variables: {
                          input: {
                            message: message.trim(),
                            email: email.trim() || undefined,
                          },
                        },
                      }),
                    { successMessage: t('chat.sent') },
                  );

                  setMessage('');
                  setEmail('');
                }}
              >
                {t('chat.send')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SupportAgentRoundedIcon />}
          onClick={() => setOpen(true)}
        >
          {t('chat.open')}
        </Button>
      )}
    </Box>
  );
}
