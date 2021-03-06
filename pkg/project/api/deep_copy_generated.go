// +build !ignore_autogenerated

// This file was autogenerated by deepcopy-gen. Do not edit it manually!

package api

import (
	api "k8s.io/kubernetes/pkg/api"
	unversioned "k8s.io/kubernetes/pkg/api/unversioned"
	conversion "k8s.io/kubernetes/pkg/conversion"
)

func init() {
	if err := api.Scheme.AddGeneratedDeepCopyFuncs(
		DeepCopy_api_Project,
		DeepCopy_api_ProjectList,
		DeepCopy_api_ProjectRequest,
		DeepCopy_api_ProjectSpec,
		DeepCopy_api_ProjectStatus,
	); err != nil {
		// if one of the deep copy functions is malformed, detect it immediately.
		panic(err)
	}
}

func DeepCopy_api_Project(in Project, out *Project, c *conversion.Cloner) error {
	if err := unversioned.DeepCopy_unversioned_TypeMeta(in.TypeMeta, &out.TypeMeta, c); err != nil {
		return err
	}
	if err := api.DeepCopy_api_ObjectMeta(in.ObjectMeta, &out.ObjectMeta, c); err != nil {
		return err
	}
	if err := DeepCopy_api_ProjectSpec(in.Spec, &out.Spec, c); err != nil {
		return err
	}
	if err := DeepCopy_api_ProjectStatus(in.Status, &out.Status, c); err != nil {
		return err
	}
	return nil
}

func DeepCopy_api_ProjectList(in ProjectList, out *ProjectList, c *conversion.Cloner) error {
	if err := unversioned.DeepCopy_unversioned_TypeMeta(in.TypeMeta, &out.TypeMeta, c); err != nil {
		return err
	}
	if err := unversioned.DeepCopy_unversioned_ListMeta(in.ListMeta, &out.ListMeta, c); err != nil {
		return err
	}
	if in.Items != nil {
		in, out := in.Items, &out.Items
		*out = make([]Project, len(in))
		for i := range in {
			if err := DeepCopy_api_Project(in[i], &(*out)[i], c); err != nil {
				return err
			}
		}
	} else {
		out.Items = nil
	}
	return nil
}

func DeepCopy_api_ProjectRequest(in ProjectRequest, out *ProjectRequest, c *conversion.Cloner) error {
	if err := unversioned.DeepCopy_unversioned_TypeMeta(in.TypeMeta, &out.TypeMeta, c); err != nil {
		return err
	}
	if err := api.DeepCopy_api_ObjectMeta(in.ObjectMeta, &out.ObjectMeta, c); err != nil {
		return err
	}
	out.DisplayName = in.DisplayName
	out.Description = in.Description
	return nil
}

func DeepCopy_api_ProjectSpec(in ProjectSpec, out *ProjectSpec, c *conversion.Cloner) error {
	if in.Finalizers != nil {
		in, out := in.Finalizers, &out.Finalizers
		*out = make([]api.FinalizerName, len(in))
		for i := range in {
			(*out)[i] = in[i]
		}
	} else {
		out.Finalizers = nil
	}
	return nil
}

func DeepCopy_api_ProjectStatus(in ProjectStatus, out *ProjectStatus, c *conversion.Cloner) error {
	out.Phase = in.Phase
	return nil
}
