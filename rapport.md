Ce document fait office de "rapport" où je reporte le cheminement parcouru à travers les différentes étapes du projet.


- Cas de vulnérabilités connues

J'ai donc cherché parmi les marques d'appareils impliqués dans cette attaque, et suis tombé sur Sierra Wireless.
Outre le support officiel, les informations trouvées révèlent une autre façon de mettre à jour le firmware d'un appareil, et le lien de l'exécutable est présent sur la page, mais peut-on vraiment avoir totalement confiance en cette source qui ne semble pas être officielle ?


- Jouets connectés

J'ai ensuite entendu parler d'un cas qui est passé aux informations télévisées, et a été l'objet de nombreux articles de journaux à travers l'Europe : un jouet connecté avec lequel un enfant peut interagir, discuter, etc.
Ce jouet est une poupée possédant des micros et une caméra pour réagir aux paroles et gestes d'un enfant, ainsi qu'un micro pour lui répondre. La connection à la poupée n'est cependant pas du tout sécurisée, et quelques personnes ont réussi à exploiter cette vulnérabilité pour communiquer directement avec des enfants. C'est la porte ouverte pour des potentiels pédophiles ou harceleurs de pouvoir espionner et même discuter avec des enfants.
A ce jour elle a été interdite à la vente en Allemagne, mais toujours pas en France.
Les documents expliquent la marche à suivre pour se connecter, et l'on voit rapidement que l'accès est ouvert.


- Babyphones

Tout en restant dans tout ce qui se rapporte aux enfants, j'ai pensé aux babyphones, ces appareils qui permettent maintenant de voir et d'entendre son enfant dans sa chambre, depuis son smartphone même lorsqu'on ne se trouve pas à la maison.
L'étude de cas se penche sur quelques modèles que les auteurs considèrent comme présentant une faille de sécurité.


- Concernant les grands fabriquants d'IoT

Intéressons nous à présent aux grands providers d'IoT :
Recherche d'informations individuellement pour chacun, notamment sur les politiques de mise à jour des appareils, l'installation, etc.
Le problème rencontré ici est défini par le fait que la majorité des articles consultés faisant leur liste des plus importants providers d'IoT incluent tous les services de cloud que peuvent offrir des compagnies telles que Amazon, IBM, Microsoft, ou Google.

Google produit des équipements pour monitorer certaines information de votre maison. L'un de ceux-là est un thermostat : Nest. Le lien suivant présente une méthode trouvée par des chercheurs pour compromettre le thermostat :
https://www.scmagazineuk.com/google-nest-hacked-in-15-seconds-as-reality-bites-for-internet-of-things/article/541215/


- Les fabriquants des derniers produits high-tech grand public

Concernant quelques-uns des grands fabriquants d'équipements électroniques, il semble également intéressant de se focaliser sur tous ces produits qui envahissent petit à petit notre quotidien et qui sont très largement proposés par une majorité de grands groupes qui produisent nos smartphones. En effet nous retrouvons de plus en plus d'offres pour les derniers nés des smartphones auxquels sont associés les nouveaux appareils connectés qui vont peut-être bientôt remplacer nos anciennes montres : les smartwatch.
Ces appareils qui peuvent transmettre à notre smartphone de nombreuses informations de notre quotidien connaissent jusqu'à notre rythme cardiaque, notre position, nos habitudes, et ce en temps réel. Les informations communiquées, le sont-elles de façon sécurisée ? C'est la question à laquelle nous voulons répondre.

Premier exemple : l'Apple Watch.
Un article fait référence de nombreux problèmes de sécurité sur ce modèle :
www.bankinfosecurity.com/apple-watch-x-security-questions-a-7997
Il reste à espérer que depuis sa parution, ces problèmes aient pu être réglés.


- Parenthèse sur d'autres objets commandés à distance

Comme il était question précédemment de commmunication concernant des informations de santé, je souhaitais rapidement faire une parenthèse sur des appareils utilisés depuis quelques années maintenant, qui peuvent se classer dans une catégorie un peu à part des objets connectés, mais dont il est pourtant possible d'observer de mode de fonctionnement : le pacemaker.

- Les Smart Home

Intéressons-nous à présent aux maisons connectées. Il n'est pas rare de voir des maisons commandées entièrement par un ensemble d'équipements numériques, des thermostats gérant la température, à la fermeture des volets, en passant par le verrouillage des portes. Il est relativement courant de voir ce genre de système mené à mal dans l'un ou l'autre film ou série, dont la dernière apparition qui me vient à l'esprit est une scène où aussi bien le son des hauts parleurs que la température des pièces ou les systèmes d'éclairage sont commandés par des individus malveillants, qui en profitent pour tout dérégler dans l'objectif de semer le chaos pour faire partir les locataires de chez eux (2ème saison de Mr Robot).
Qu'en est-il donc vraiment dans la réalité, ces systèmes sont-ils sûrs ?


