import type { StructureBuilder } from 'sanity/structure';

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog Posts')
        .child(
          S.list()
            .title('Blog Posts')
            .items([
              S.listItem()
                .title('All Posts')
                .child(S.documentTypeList('post').title('All Posts')),
              S.listItem()
                .title('Published')
                .child(
                  S.documentList()
                    .title('Published')
                    .filter('_type == "post" && status == "published"')
                ),
              S.listItem()
                .title('Drafts')
                .child(
                  S.documentList()
                    .title('Drafts')
                    .filter('_type == "post" && status != "published"')
                ),
              S.listItem()
                .title('Featured')
                .child(
                  S.documentList()
                    .title('Featured')
                    .filter('_type == "post" && featured == true')
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('tag').title('Tags'),
      S.divider(),
      S.documentTypeListItem('servicePage').title('Service Pages'),
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('experience').title('Experience'),
      S.documentTypeListItem('education').title('Education'),
      S.documentTypeListItem('skill').title('Skills'),
      S.documentTypeListItem('faq').title('FAQs'),
      S.divider(),
      S.documentTypeListItem('siteSettings').title('Site Settings'),
    ]);
