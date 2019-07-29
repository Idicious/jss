import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { isAbsoluteUrl } from '@sitecore-jss/sitecore-jss';
import { RichTextField } from './rendering-field';

@Directive({
  selector: '[scGenericRichText]',
})
export class GenericRichTextDirective implements OnChanges {
  private viewRef: EmbeddedViewRef<any>;

  // tslint:disable-next-line:no-input-rename
  @Input('scGenericRichTextEditable')
  editable = true;

  // tslint:disable-next-line:no-input-rename
  @Input('scGenericRichText')
  field: RichTextField;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['field'] || changes['editable']) {
      if (!this.viewRef) {
        this.viewContainer.clear();
        this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef);
      }

      this.updateView();
    }
  }

  private updateView() {
    const field = this.field;
    if (!field || (!field.editable && !field.value)) {
      return;
    }

    const html = field.editable && this.editable ? field.editable : field.value;
    this.viewRef.rootNodes.forEach((node) => {
      node.innerHTML = html;
      const links = node.querySelectorAll('a[href]');

      links.forEach((link) => {
        const href = link.getAttribute('href');

        if (!isAbsoluteUrl(href)) {
          this.renderer.listen(link, 'click', (event) => {
            this.router.navigateByUrl(href);
            event.preventDefault();
          });
        }
      });
    });
  }
}
