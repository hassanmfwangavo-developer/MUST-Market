REVOKE EXECUTE ON FUNCTION public.prevent_rewards_self_update() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_verified_self_grant() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;