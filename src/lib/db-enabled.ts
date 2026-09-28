/**
 * “Há base de dados?” — sem carregar o Supabase para saber.
 *
 * Ler duas variáveis de ambiente não devia obrigar a descarregar 57 kB de
 * biblioteca. Este ficheiro existe para que o site possa decidir o que
 * mostrar (o painel de pedidos, o aviso de “sem base de dados”) sem puxar
 * o cliente; o cliente entra depois, só quando alguém envia um pedido.
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseEnabled = Boolean(url && anonKey);
export const supabaseUrl = url ?? "";
export const supabaseAnonKey = anonKey ?? "";
