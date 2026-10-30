"""Builds languages/*.l10n.php for the plugin. Usage: translations.py <plugin dir>."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from extract import found  # noqa: E402  (runs the extraction on argv[1])

# Same text in every language: brand and proper names.
SAME = {'MASP', 'Usina do Gasômetro', 'Meetup.com', 'Facebook', 'Facebook / LinkedIn', 'X (Twitter)', 'Online', 'Status / Stories'}

# (english, context) -> (pt_BR, es_ES)
T = {
    ('Sugarloaf Mountain', None): ('Pão de Açúcar', 'Pan de Azúcar'),
    ('Pampulha Church', None): ('Igrejinha da Pampulha', 'Iglesia de Pampulha'),
    ('Curitiba Botanical Garden', None): ('Jardim Botânico de Curitiba', 'Jardín Botánico de Curitiba'),
    ('Hercílio Luz Bridge', None): ('Ponte Hercílio Luz', 'Puente Hercílio Luz'),
    ('National Congress', None): ('Congresso Nacional', 'Congreso Nacional'),
    ('Castle Tower', None): ('Torre do Castelo', 'Torre del Castillo'),
    ('Fortaleza Cathedral', None): ('Catedral de Fortaleza', 'Catedral de Fortaleza'),
    ('Penha Convent', None): ('Convento da Penha', 'Convento de Penha'),
    ('Goiás Avenue Clock', None): ('Relógio da Av. Goiás', 'Reloj de la Av. Goiás'),
    ('São Carlos Cathedral', None): ('Catedral de São Carlos', 'Catedral de São Carlos'),
    ('São Tomé Lighthouse', None): ('Farol de São Tomé', 'Faro de São Tomé'),
    ('Cristo Luz and the waterfront', None): ('Cristo Luz e orla', 'Cristo Luz y la costa'),
    ('Rio Branco Palace', None): ('Palácio Rio Branco', 'Palacio Rio Branco'),
    ('City buildings (generic)', None): ('Prédios da cidade (genérico)', 'Edificios de la ciudad (genérico)'),
    ('Brazil', None): ('Brasil', 'Brasil'),
    ('The generator needs JavaScript enabled in your browser.', None): ('O gerador precisa do JavaScript ativado no navegador.', 'El generador necesita JavaScript activado en el navegador.'),
    ('Your community', None): ('Sua comunidade', 'Tu comunidad'),
    ('City', None): ('Cidade', 'Ciudad'),
    ('Type to search, e.g.: Curitiba', None): ('Digite para buscar, ex.: Curitiba', 'Escribe para buscar, ej.: Curitiba'),
    ('Pick a community from the list or type any city.', None): ('Escolha uma comunidade da lista ou digite qualquer cidade.', 'Elige una comunidad de la lista o escribe cualquier ciudad.'),
    ('Landmark in the background', None): ('Ponto turístico no fundo', 'Punto turístico de fondo'),
    ('Shows up as a shadow in the bottom right corner of the artwork.', None): ('Aparece como uma sombra no canto inferior direito da arte.', 'Aparece como una sombra en la esquina inferior derecha del arte.'),
    ('Your image', None): ('Sua imagem', 'Tu imagen'),
    ('Upload image', None): ('Enviar imagem', 'Subir imagen'),
    ('A photo or drawing of a local landmark. It becomes a blue watermark: dark areas show up, light areas disappear. Images with a transparent background work best.', None):
        ('Uma foto ou desenho de um ponto turístico local. Ela vira uma marca d’água azul: as áreas escuras aparecem e as claras somem. Imagens com fundo transparente funcionam melhor.',
         'Una foto o dibujo de un punto turístico local. Se convierte en una marca de agua azul: las zonas oscuras aparecen y las claras desaparecen. Las imágenes con fondo transparente funcionan mejor.'),
    ('About the event', None): ('Sobre o evento', 'Sobre el evento'),
    ('Event type', None): ('Tipo de evento', 'Tipo de evento'),
    ('In person', None): ('Presencial', 'Presencial'),
    ('Text next to the logo', None): ('Texto ao lado do logo', 'Texto junto al logo'),
    ('Date', None): ('Data', 'Fecha'),
    ('Time', None): ('Horário', 'Hora'),
    ('Without date and time, the artwork shows the block editor toolbar.', None): ('Sem data e horário, a arte mostra a barra de ferramentas do editor de blocos.', 'Sin fecha ni hora, el arte muestra la barra de herramientas del editor de bloques.'),
    ('Meetup title (theme)', None): ('Título do meetup (tema)', 'Título del meetup (tema)'),
    ('Goes inside the blue box. E.g.: Behind the scenes of WordPress projects', None): ('Fica dentro do campo azul. Ex.: Bastidores de projetos com WordPress', 'Va dentro del recuadro azul. Ej.: Detrás de escena de proyectos con WordPress'),
    ('Title style', None): ('Estilo do título', 'Estilo del título'),
    ('Regular', None): ('Normal', 'Normal'),
    ('Bold', None): ('Negrito', 'Negrita'),
    ('Description (optional)', None): ('Descrição (opcional)', 'Descripción (opcional)'),
    ('Footer highlight (optional)', None): ('Destaque no rodapé (opcional)', 'Destacado al pie (opcional)'),
    ('E.g.: Free event', None): ('Ex.: Evento gratuito', 'Ej.: Evento gratuito'),
    ('Venue and address', None): ('Local e endereço', 'Lugar y dirección'),
    ('E.g.: University auditorium · 123 Example St – Downtown', None): ('Ex.: Auditório da Universidade · Rua Exemplo, 123 – Centro', 'Ej.: Auditorio de la Universidad · Calle Ejemplo 123 – Centro'),
    ('Show the venue on the artwork', None): ('Mostrar o local na arte', 'Mostrar el lugar en el arte'),
    ('Registration link', None): ('Link de inscrição', 'Link de inscripción'),
    ('The event page on Meetup.com or wherever people RSVP. Used in the announcement texts.', None): ('Página do evento no Meetup.com ou onde as pessoas confirmam presença. Usado nos textos de divulgação.', 'La página del evento en Meetup.com o donde la gente confirma asistencia. Se usa en los textos de difusión.'),
    ('Talks and speakers', None): ('Palestras e palestrantes', 'Charlas y ponentes'),
    ('Add talk', None): ('Adicionar palestra', 'Añadir charla'),
    ('Supporters and sponsors', None): ('Apoio e patrocínio', 'Apoyo y patrocinio'),
    ('Logos of whoever supports or hosts the event. PNG with a transparent background works best.', None): ('Logos de quem apoia ou recebe o evento. Prefira PNG com fundo transparente.', 'Logos de quien apoya o recibe el evento. Mejor en PNG con fondo transparente.'),
    ('Add logo', None): ('Adicionar logo', 'Añadir logo'),
    ('Start over', None): ('Recomeçar do zero', 'Empezar de nuevo'),
    ('Choose the format and download', None): ('Escolha o formato e baixe', 'Elige el formato y descarga'),
    ('Artwork colors', None): ('Cores da arte', 'Colores del arte'),
    ('Light', None): ('Claro', 'Claro'),
    ('Dark', None): ('Escuro', 'Oscuro'),
    ('Artwork format', None): ('Formato da arte', 'Formato del arte'),
    ('Artwork preview', None): ('Prévia da arte', 'Vista previa del arte'),
    ('Download this artwork', None): ('Baixar esta arte', 'Descargar este arte'),
    ('Download all formats', None): ('Baixar todos os formatos', 'Descargar todos los formatos'),
    ('Announcement texts', None): ('Textos para divulgar', 'Textos para difundir'),
    ('optional', None): ('opcional', 'opcional'),
    ('Ready-made texts with the event details, written the way each network works. Open a network, review and copy. Anything [in brackets] still needs to be filled in the form.', None):
        ('Textos prontos com as informações do evento, no jeito de cada rede. Abra a rede, confira e copie. O que estiver [entre colchetes] ainda precisa ser preenchido no formulário.',
         'Textos listos con la información del evento, al estilo de cada red. Abre la red, revisa y copia. Lo que esté [entre corchetes] todavía falta completar en el formulario.'),
    ('Move up', None): ('Mover para cima', 'Subir'),
    ('Move down', None): ('Mover para baixo', 'Bajar'),
    ('Remove', None): ('Remover', 'Quitar'),
    ('Photo', None): ('Foto', 'Foto'),
    ('Remove photo', None): ('Tirar foto', 'Quitar foto'),
    ('Talk title', None): ('Título da palestra', 'Título de la charla'),
    ('Speaker name', None): ('Nome da pessoa', 'Nombre de la persona'),
    ('Upload logo', None): ('Enviar logo', 'Subir logo'),
    ('Remove logo', None): ('Tirar logo', 'Quitar logo'),
    ('Name (shown in the texts, and on the artwork if there is no logo)', None): ('Nome (aparece nos textos e na arte se não houver logo)', 'Nombre (aparece en los textos y en el arte si no hay logo)'),
    ('Missing info', None): ('Falta preencher', 'Falta completar'),
    ('Copy text', None): ('Copiar texto', 'Copiar texto'),
    ('Other city…', None): ('Outra cidade…', 'Otra ciudad…'),
    ('None', None): ('Nenhum', 'Ninguno'),
    ('My own image…', None): ('Minha própria imagem…', 'Mi propia imagen…'),
    ('Your meetup title', None): ('Título do seu meetup', 'Título de tu meetup'),
    ('WordPress %s (online)', None): ('WordPress %s (online)', 'WordPress %s (online)'),
    ('Talk %d', None): ('Palestra %d', 'Charla %d'),
    ('Supporter %d', None): ('Apoiador %d', 'Apoyo %d'),
    ('This image could not be opened. Try a JPG or PNG file.', None): ('Não foi possível abrir esta imagem. Tente um arquivo JPG ou PNG.', 'No se pudo abrir esta imagen. Prueba con un archivo JPG o PNG.'),
    ('The text is too long for this format; try shortening the title or the description.', None): ('o texto ficou longo para este formato; tente encurtar o título ou a descrição.', 'el texto es largo para este formato; prueba acortar el título o la descripción.'),
    ('Erase everything you filled in and start a new artwork?', None): ('Apagar tudo o que foi preenchido e começar uma arte nova?', '¿Borrar todo lo que completaste y empezar un arte nuevo?'),
    ('Text copied!', None): ('Texto copiado!', '¡Texto copiado!'),
    ('Could not copy automatically. The text is selected: press Ctrl+C (or Cmd+C).', None): ('Não deu para copiar automaticamente. O texto foi selecionado: use Ctrl+C (ou Cmd+C).', 'No se pudo copiar automáticamente. El texto está seleccionado: usa Ctrl+C (o Cmd+C).'),
    ('Text for %s', None): ('Texto para %s', 'Texto para %s'),
    ('%1$s of %2$s characters', None): ('%1$s de %2$s caracteres', '%1$s de %2$s caracteres'),
    ('%s characters', None): ('%s caracteres', '%s caracteres'),
    ('In-person Meetup', None): ('Meetup Presencial', 'Meetup Presencial'),
    ('Online Meetup', None): ('Meetup Online', 'Meetup Online'),
    ('WordPress Brasil Online Meetup', None): ('WordPress Brasil Meetup Online', 'WordPress Brasil Meetup Online'),
    ('%s WordPress Community', None): ('Comunidade WordPress de %s', 'Comunidad WordPress de %s'),
    ('WordPress Community', None): ('Comunidade WordPress', 'Comunidad WordPress'),
    ('Getting started with the block editor', None): ('Primeiros passos com o editor de blocos', 'Primeros pasos con el editor de bloques'),
    ('Free event', None): ('Evento gratuito', 'Evento gratuito'),
    ('[date]', None): ('[data]', '[fecha]'),
    ('[time]', None): ('[horário]', '[hora]'),
    ('[venue and address]', None): ('[local e endereço]', '[lugar y dirección]'),
    ('[registration link]', None): ('[link de inscrição]', '[link de inscripción]'),
    ('[city]', None): ('[cidade]', '[ciudad]'),
    ('A new %s meetup is coming up!', None): ('Vem aí mais um meetup da %s!', '¡Se viene un nuevo meetup de la %s!'),
    ('A new online %s meetup is coming up!', None): ('Vem aí mais um meetup online da %s!', '¡Se viene un nuevo meetup online de la %s!'),
    ('An open gathering to learn, share experiences and meet people who use WordPress all over Brazil.', None):
        ('Um encontro aberto para aprender, trocar experiências e conhecer gente que usa WordPress em todo o Brasil.',
         'Un encuentro abierto para aprender, compartir experiencias y conocer gente que usa WordPress en todo Brasil.'),
    ('An open gathering to learn, share experiences and meet other people who use WordPress in %s.', None):
        ('Um encontro aberto para aprender, trocar experiências e conhecer quem também usa WordPress em %s.',
         'Un encuentro abierto para aprender, compartir experiencias y conocer a otras personas que usan WordPress en %s.'),
    ('On', 'before Sunday'): ('No', 'El'),
    ('On', 'before Monday'): ('Na', 'El'),
    ('On', 'before Tuesday'): ('Na', 'El'),
    ('On', 'before Wednesday'): ('Na', 'El'),
    ('On', 'before Thursday'): ('Na', 'El'),
    ('On', 'before Friday'): ('Na', 'El'),
    ('On', 'before Saturday'): ('No', 'El'),
    ('On', 'before a missing date'): ('Em', 'El'),
    ('at %s', None): ('às %s', 'a las %s'),
    ('we meet in %s.', None): ('a gente se encontra em %s.', 'nos encontramos en %s.'),
    ('we meet online.', None): ('a gente se encontra online.', 'nos encontramos online.'),
    ('Brasília time', None): ('horário de Brasília', 'hora de Brasilia'),
    ('Acre time', None): ('horário do Acre', 'hora de Acre'),
    ('Manaus time', None): ('horário de Manaus', 'hora de Manaos'),
    ('When:', None): ('Quando:', 'Cuándo:'),
    ('Where:', None): ('Onde:', 'Dónde:'),
    ('%1$s — with %2$s', None): ('%1$s — com %2$s', '%1$s — con %2$s'),
    ('WordPressCommunity', 'hashtag, no spaces'): ('ComunidadeWordPress', 'ComunidadWordPress'),
    ('Online. The streaming link is available here on Meetup for everyone who RSVPs.', None):
        ('Online. O link da transmissão fica disponível aqui no Meetup para quem confirmar presença.',
         'Online. El link de la transmisión está disponible aquí en Meetup para quien confirme asistencia.'),
    ('SCHEDULE', None): ('PROGRAMAÇÃO', 'PROGRAMA'),
    ('WHO IS IT FOR', None): ('PARA QUEM É', 'PARA QUIÉN ES'),
    ('For people who use WordPress, build sites, develop or are just getting started. No experience needed: the community is open and welcoming.', None):
        ('Para quem usa, cria sites, desenvolve ou está começando com WordPress. Não precisa de experiência: a comunidade é aberta e acolhedora.',
         'Para quien usa WordPress, crea sitios, desarrolla o está empezando. No hace falta experiencia: la comunidad es abierta y acogedora.'),
    ('SUPPORT', None): ('APOIO', 'APOYO'),
    ('Special thanks for the support: %s.', None): ('Agradecimento especial pelo apoio: %s.', 'Agradecimiento especial por el apoyo: %s.'),
    ('RSVP here on Meetup to get the event reminders. If you can no longer make it, update your RSVP to free up the spot for someone else.', None):
        ('Confirme sua presença aqui no Meetup para receber os lembretes do evento. Se não puder mais ir, atualize sua resposta para liberar a vaga para outra pessoa.',
         'Confirma tu asistencia aquí en Meetup para recibir los recordatorios del evento. Si ya no puedes ir, actualiza tu respuesta para liberar el lugar para otra persona.'),
    ('WordPress community events follow the community code of conduct: respect and a welcoming space come first.', None):
        ('Os eventos da comunidade WordPress seguem o código de conduta da comunidade: respeito e acolhimento em primeiro lugar.',
         'Los eventos de la comunidad WordPress siguen el código de conducta de la comunidad: respeto y un espacio acogedor ante todo.'),
    ('On the schedule:', None): ('Na programação:', 'En el programa:'),
    ('Save your spot: %s', None): ('Garanta sua vaga: %s', 'Reserva tu lugar: %s'),
    ('Thanks for the support, %s!', None): ('Valeu pelo apoio, %s!', '¡Gracias por el apoyo, %s!'),
    ('Know someone who would enjoy this? Tag them in the comments or share!', None): ('Conhece alguém que vai gostar? Marque nos comentários ou compartilhe!', '¿Conoces a alguien a quien le pueda interesar? ¡Etiquétalo en los comentarios o comparte!'),
    ('Speakers:', None): ('Quem fala:', 'Quién habla:'),
    ('Registration via the link in bio.', None): ('Inscrições pelo link na bio.', 'Inscripciones en el link de la bio.'),
    ('Tag who is coming with you!', None): ('Marque quem vai com você!', '¡Etiqueta a quien va contigo!'),
    ('Venue: %s', None): ('Local: %s', 'Lugar: %s'),
    ('Registration: %s', None): ('Inscrições: %s', 'Inscripciones: %s'),
    ('Know someone who would enjoy this? Share it or tag them in the comments.', None): ('Conhece alguém que vai gostar? Compartilhe ou marque nos comentários.', '¿Conoces a alguien a quien le pueda interesar? Comparte o etiquétalo en los comentarios.'),
    ('WordPress meetup in %s', None): ('Tem meetup WordPress em %s', 'Meetup de WordPress en %s'),
    ('Online WordPress meetup', None): ('Tem meetup WordPress online', 'Meetup de WordPress online'),
    ('%d talks on the schedule', None): ('%d palestras na programação', '%d charlas en el programa'),
    ('in %s', None): ('em %s', 'en %s'),
    ('online', None): ('online', 'online'),
    ('Schedule:', None): ('Programação:', 'Programa:'),
    ('Register:', None): ('Inscreva-se:', 'Inscríbete:'),
    ('Forward this to anyone who would enjoy it!', None): ('Encaminhe para quem também vai gostar!', '¡Reenvíalo a quien le pueda interesar!'),
    ('Event description', None): ('Descrição do evento', 'Descripción del evento'),
    ('Paste it in the event description. Use the artwork title as the event name and upload the "Meetup.com" artwork as the cover image.', None):
        ('Cole na descrição do evento. Use o título da arte como nome do evento e envie a arte "Meetup.com" como imagem de capa.',
         'Pégalo en la descripción del evento. Usa el título del arte como nombre del evento y sube el arte "Meetup.com" como imagen de portada.'),
    ('Post or event', None): ('Post ou evento', 'Publicación o evento'),
    ('Post it with the "Facebook" or "Square" artwork. If you create a Facebook event, use this text as its description.', None):
        ('Publique junto com a arte "Facebook" ou "Quadrado". Se criar um evento no Facebook, use este texto na descrição.',
         'Publícalo con el arte "Facebook" o "Cuadrado". Si creas un evento en Facebook, usa este texto como descripción.'),
    ('Post caption', None): ('Legenda do post', 'Texto de la publicación'),
    ('Links in captions are not clickable on Instagram: put the registration link in your bio or use the link sticker in Stories. Tag the speakers and supporters on the image.', None):
        ('Links na legenda não são clicáveis no Instagram: coloque o link de inscrição na bio ou use o adesivo de link nos Stories. Marque quem vai palestrar e os apoiadores na imagem.',
         'Los links en el texto no son clicables en Instagram: pon el link de inscripción en la bio o usa el sticker de link en las Historias. Etiqueta a los ponentes y a quienes apoyan en la imagen.'),
    ('Post', None): ('Post', 'Publicación'),
    ('After pasting, tag the speakers and supporting companies by typing @ before their names. This increases the reach of the post.', None):
        ('Depois de colar, marque quem vai palestrar e as empresas apoiadoras digitando @ antes do nome. Isso aumenta o alcance do post.',
         'Después de pegar, etiqueta a los ponentes y a las empresas que apoyan escribiendo @ antes del nombre. Eso aumenta el alcance de la publicación.'),
    ('Up to 280 characters', None): ('Até 280 caracteres', 'Hasta 280 caracteres'),
    ('The text is adjusted to fit 280 characters (each link counts as 23). To detail the schedule, reply to your own post.', None):
        ('O texto é ajustado para caber em 280 caracteres (cada link conta como 23). Para detalhar a programação, responda ao próprio post.',
         'El texto se ajusta para caber en 280 caracteres (cada link cuenta como 23). Para detallar el programa, responde a tu propia publicación.'),
    ('Groups and lists', None): ('Grupos e listas', 'Grupos y listas'),
    ('Asterisks make text bold on WhatsApp. Send it with the "Square" artwork (chats) or the "Status / Stories" one (status).', None):
        ('Os asteriscos deixam o texto em negrito no WhatsApp. Envie junto a arte "Quadrado" (conversas) ou "Status / Stories" (status).',
         'Los asteriscos ponen el texto en negrita en WhatsApp. Envíalo con el arte "Cuadrado" (chats) o "Status / Stories" (estados).'),
    ('Skip to the generator', None): ('Pular para o gerador', 'Saltar al generador'),
    ('WordPress Brazil Community', None): ('Comunidade WordPress Brasil', 'Comunidad WordPress Brasil'),
    ('Language', None): ('Idioma', 'Idioma'),
    ('Change', None): ('Trocar', 'Cambiar'),
    ('Dashboard', None): ('Painel', 'Escritorio'),
    ('Meetup Artwork Generator', None): ('Gerador de Artes para Meetups', 'Generador de Artes para Meetups'),
    ('Fill in your meetup details, check the preview and download the artwork in the format of each network. At the end, copy the ready-made texts to spread the word. Everything stays saved in this browser until you start over.', None):
        ('Preencha as informações do seu meetup, confira a prévia e baixe a arte no formato de cada rede. No final, copie os textos prontos para divulgar. Tudo fica salvo neste navegador até você recomeçar.',
         'Completa la información de tu meetup, revisa la vista previa y descarga el arte en el formato de cada red. Al final, copia los textos listos para difundir. Todo queda guardado en este navegador hasta que empieces de nuevo.'),
    ('Made by and for the WordPress community in Brazil. Images and texts are generated in your browser and are not sent to any server.', None):
        ('Feito pela e para a comunidade WordPress do Brasil. As imagens e os textos são gerados no seu navegador e não são enviados para nenhum servidor.',
         'Hecho por y para la comunidad WordPress de Brasil. Las imágenes y los textos se generan en tu navegador y no se envían a ningún servidor.'),
    ('Open generator', None): ('Abrir gerador', 'Abrir generador'),
    ('Event cover', None): ('Capa do evento', 'Portada del evento'),
    ('Link post', None): ('Post com link', 'Publicación con link'),
    ('Image post', None): ('Post com imagem', 'Publicación con imagen'),
    ('Square', None): ('Quadrado', 'Cuadrado'),
    ('Instagram, Facebook and WhatsApp', None): ('Instagram, Facebook e WhatsApp', 'Instagram, Facebook y WhatsApp'),
    ('Portrait', None): ('Retrato', 'Vertical'),
    ('Instagram and Facebook feed', None): ('Feed do Instagram e Facebook', 'Feed de Instagram y Facebook'),
    ('WhatsApp and Instagram', None): ('WhatsApp e Instagram', 'WhatsApp e Instagram'),
}
T[('WhatsApp and Instagram', None)] = ('WhatsApp e Instagram', 'WhatsApp e Instagram')
T[('Time zone', None)] = ('Fuso horário', 'Zona horaria')
T[('TZ', 'time zone abbreviation')] = ('Fuso', 'Zona')


def php_string(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


missing = [k for k in found if k not in T and k[0] not in SAME]
if missing:
    sys.exit('Missing translations: ' + repr(missing))

extra = [k for k in T if k not in found]
for locale, index, plural in (('pt_BR', 0, 'nplurals=2; plural=n > 1;'), ('es_ES', 1, 'nplurals=2; plural=n != 1;')):
    lines = []
    for key in found:
        if key not in T:
            continue
        original, context = key
        msgid = f"{context}\x04{original}" if context else original
        msgid_php = php_string(original) if not context else php_string(context) + ' . "\\4" . ' + php_string(original)
        lines.append(f"\t\t{msgid_php} => {php_string(T[key][index])},")
    body = '\n'.join(lines)
    content = (
        "<?php\n"
        "// Generated by the translation script. Translations for the Gerador de Artes plugin.\n"
        "return array(\n"
        f"\t'domain' => 'meetup-artwork-generator',\n"
        f"\t'language' => '{locale}',\n"
        f"\t'plural-forms' => '{plural}',\n"
        "\t'messages' => array(\n"
        f"{body}\n"
        "\t),\n"
        ");\n"
    )
    out = os.path.join(sys.argv[1], 'languages', f'meetup-artwork-generator-{locale}.l10n.php')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(content)
    print('wrote', out, len(lines))
if extra:
    print('unused:', extra)


def po_string(text):
    return '"' + text.replace('\\', '\\\\').replace('"', '\\"') + '"'


# Template for translators (translate.wordpress.org, Poedit, Loco Translate).
pot = [
    'msgid ""',
    'msgstr ""',
    '"Project-Id-Version: Gerador de Artes\\n"',
    '"MIME-Version: 1.0\\n"',
    '"Content-Type: text/plain; charset=UTF-8\\n"',
    '"Content-Transfer-Encoding: 8bit\\n"',
    '"X-Domain: meetup-artwork-generator\\n"',
    '',
]
for original, context in found:
    if '%' in original:
        pot.append('#, php-format')
    if context:
        pot.append('msgctxt ' + po_string(context))
    pot.append('msgid ' + po_string(original))
    pot.append('msgstr ""')
    pot.append('')
open(os.path.join(sys.argv[1], 'languages', 'meetup-artwork-generator.pot'), 'w').write('\n'.join(pot))
print('wrote pot', len(found))
